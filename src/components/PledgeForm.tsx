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

interface PledgeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
}

interface PledgeFormData {
  amount: number;
  pledgeDate: string;
  message?: string;
}

export function PledgeForm({ open, onOpenChange, campaign }: PledgeFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PledgeFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calculate min and max dates
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const onSubmit = async (data: PledgeFormData) => {
    if (!campaign?.id) return;
    
    setIsLoading(true);
    try {
      await api.campaigns.pledge(campaign.id, data);
      
      toast({
        title: "Thank you!",
        description: "Your pledge has been recorded. We'll remind you when it's time to contribute.",
      });
      
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error pledging:', error);
      toast({
        title: "Error",
        description: "Failed to record pledge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <Label htmlFor="pledgeDate">When would you like to contribute?</Label>
            <Input
              id="pledgeDate"
              type="date"
              {...register("pledgeDate", { 
                required: "Date is required",
                min: { value: today, message: "Date cannot be in the past" },
                max: { value: maxDateString, message: "Date cannot be more than a year in the future" }
              })}
            />
            {errors.pledgeDate && (
              <p className="text-sm text-red-500">{errors.pledgeDate.message}</p>
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
  );
}
