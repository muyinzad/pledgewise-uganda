import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Campaign } from "@/types/campaign";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContributeForm } from "./ContributeForm";
import { EditCampaignForm } from './EditCampaignForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, MapPin, Calendar } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progressValue, setProgressValue] = useState(0);

  const currentAmount = campaign?.currentAmount || 0;
  const targetAmount = campaign?.targetAmount || 0;
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isOwner = user?.id === campaign?.creatorId;
  const contributors = campaign?.supporters || 0;

  // Animate progress bar when value changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/campaign/${campaign.id}`);
  };

  // Truncate description to 300 characters
  const truncatedDescription = campaign?.description 
    ? campaign.description.length > 300 
      ? campaign.description.slice(0, 300) + '...'
      : campaign.description
    : 'No description available';

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={campaign.imageUrl || '/placeholder-campaign.jpg'}
            alt={campaign.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white font-semibold text-lg line-clamp-2">
              {campaign.title}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {truncatedDescription}
        </p>
        
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span>UGX {currentAmount.toLocaleString()} contributed</span>
            <span className="text-gray-500">of UGX {targetAmount.toLocaleString()} goal</span>
          </div>
          <div className="relative">
            <Progress 
              value={progressValue}
              className="h-2 transition-all duration-500 ease-out" 
            />
            {progressValue >= 100 && (
              <div className="absolute inset-0 bg-green-500/20 animate-pulse rounded-full" />
            )}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{progressValue.toFixed(1)}% Complete</span>
            <span>{contributors} contributors</span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{campaign?.location || 'No location'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{campaign?.daysLeft || 0} days left</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}