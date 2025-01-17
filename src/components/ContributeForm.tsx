import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Campaign } from "@/types/campaign";
import Confetti from 'react-confetti';

interface ContributeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
}

interface ContributeFormData {
  amount: number;
  message?: string;
}

export function ContributeForm({ open, onOpenChange, campaign }: ContributeFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContributeFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: ContributeFormData) => {
    if (!campaign?.id) return;
    
    setIsLoading(true);
    try {
      await api.campaigns.contribute(campaign.id, data);
      
      // Show confetti
      setShowConfetti(true);
      
      toast({
        title: "Thank you!",
        description: "Your contribution has been received.",
      });
      
      // Hide confetti and close dialog after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
        reset();
        onOpenChange(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error contributing:', error);
      toast({
        title: "Error",
        description: "Failed to process contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        />
      )}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pledge to {campaign?.title}</DialogTitle>
            <DialogDescription>
              Make a pledge now and contribute later. We'll remind you when your chosen date arrives.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Pledge Amount (UGX)</Label>
              <Input
                id="amount"
                type="number"
                {...register("amount", { 
                  required: "Amount is required",
                  min: { value: 1000, message: "Minimum amount is UGX 1,000" }
                })}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Leave a message about your pledge"
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Recording Pledge..." : "Confirm Pledge"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
