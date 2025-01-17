import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Header } from '@/components/Header';
import Confetti from 'react-confetti';

const CONTRIBUTION_AMOUNTS = [10000, 20000, 50000, 100000, 150000, 200000];
const TIP_PERCENTAGES = [10, 12, 14, 16, 18, 20];

export default function ContributionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = React.useState<string>('');
  const [tipPercentage, setTipPercentage] = React.useState(14);
  const [paymentMethod, setPaymentMethod] = React.useState('mtn');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: campaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => api.campaigns.get(id as string),
  });

  const tipAmount = Number(amount) * (tipPercentage / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Make the API call to update the campaign with the new contribution
      const result = await api.campaigns.contribute({
        campaignId: id as string,
        amount: Number(amount),
      });

      if (!result) {
        throw new Error('Failed to process contribution');
      }

      // Invalidate both the single campaign query and the campaigns list query
      await queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      // Show confetti
      setShowConfetti(true);
      
      toast({
        title: "Contribution successful!",
        description: "Thank you for your generosity.",
      });

      // Navigate after 5 seconds
      setTimeout(() => {
        navigate(`/campaign/${id}`, { replace: true });
      }, 5000);
    } catch (error: any) {
      console.error('Error contributing:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to process contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          tweenDuration={5000}
          onConfettiComplete={(confetti) => {
            setShowConfetti(false);
            confetti?.reset();
          }}
        />
      )}
      <div className="max-w-[580px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/campaign/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-4">
            <img 
              src={campaign?.imageUrl} 
              alt={campaign?.title} 
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-semibold">You're supporting {campaign?.title}</h2>
              <p className="text-gray-600 text-sm">Your contribution will benefit {campaign?.organizerName}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Amount Selection */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Enter your donation</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {CONTRIBUTION_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant={amount === String(amt) ? "default" : "outline"}
                  onClick={() => setAmount(String(amt))}
                >
                  {amt.toLocaleString()}
                </Button>
              ))}
            </div>

            <div className="relative mt-4">
              <div className="flex items-center h-16 px-4 border rounded-lg">
                <span className="text-2xl font-semibold mr-2">UGX</span>
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 text-2xl font-semibold text-right focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Tip Section */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Tip PledgeCard services</h3>
            <p className="text-gray-600 mb-4">
              PledgeCard has a 0% platform fee for organizers. PledgeCard will continue offering its
              services thanks to donors who will leave an optional amount here:
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-center text-lg font-semibold">
                {tipPercentage}%
              </div>
              <Slider
                value={[tipPercentage]}
                onValueChange={([value]) => setTipPercentage(value)}
                max={30}
                step={1}
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setTipPercentage(0)}
              >
                Enter custom tip
              </Button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Payment method</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-2"
            >
              <div className={`flex items-center justify-between rounded-lg border p-4 ${paymentMethod === 'mtn' ? 'border-black' : ''}`}>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="mtn" id="mtn" />
                  <img src="/mtn-momo.png" alt="MTN Mobile Money" className="h-6" />
                  <Label htmlFor="mtn">MTN Mobile Money</Label>
                </div>
              </div>
              <div className={`flex items-center justify-between rounded-lg border p-4 ${paymentMethod === 'airtel' ? 'border-black' : ''}`}>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="airtel" id="airtel" />
                  <img src="/airtel-money.png" alt="Airtel Money" className="h-6" />
                  <Label htmlFor="airtel">Airtel Money</Label>
                </div>
              </div>
              <div className={`flex items-center justify-between rounded-lg border p-4 ${paymentMethod === 'card' ? 'border-black' : ''}`}>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="h-5 w-5" />
                  <Label htmlFor="card">Credit or debit</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold bg-black hover:bg-gray-800 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Contribute Now</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
