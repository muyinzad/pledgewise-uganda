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

interface ContributeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
}

interface ContributeFormData {
  amount: number;
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
}

export function ContributeForm({ open, onOpenChange, campaign }: ContributeFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContributeFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: ContributeFormData) => {
    if (!campaign?.id) return;
    
    setIsLoading(true);
    try {
      await api.campaigns.contribute(campaign.id, data);
      
      toast({
        title: "Thank you!",
        description: "Your contribution has been received.",
      });
      
      reset();
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contribute to {campaign?.title}</DialogTitle>
          <DialogDescription>
            Support this campaign by making a contribution. All contributions are secure and encrypted.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
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
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              {...register("phoneNumber", { required: "Phone number is required" })}
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Leave a message of support"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Contribute"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
