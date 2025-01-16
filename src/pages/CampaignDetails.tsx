import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { 
  Heart, 
  Share2, 
  UserPlus, 
  Wallet2, 
  CreditCard, 
  Clock,
  MapPin, 
  Users,
  ChevronUp,
  MessageCircle,
  Loader2 
} from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContributeForm } from '@/components/ContributeForm';
import { PledgeForm } from '@/components/PledgeForm';
import { useToast } from "@/components/ui/use-toast";
import { Header } from '@/components/Header';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const CampaignDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isContributeOpen, setIsContributeOpen] = React.useState(false);
  const [isPledgeOpen, setIsPledgeOpen] = React.useState(false);
  const [isLoved, setIsLoved] = React.useState(false);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const { toast } = useToast();

  const { data: campaign, isLoading, isError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => api.campaigns.get(id as string),
  });

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (!campaign) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: campaign.title,
          text: campaign.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Campaign link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Campaign not found</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(campaign?.endDate || new Date()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const supporters = Math.floor(Math.random() * 100) + 20; // Mock data for demonstration

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Campaign Title */}
          <h1 className="text-3xl font-bold mb-6">{campaign?.title}</h1>

          <div className="grid md:grid-cols-[1fr_380px] gap-8">
            {/* Left Column - Campaign Image and Story */}
            <div className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={campaign?.imageUrl || '/placeholder.svg'}
                  alt={campaign?.title || 'Campaign'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Campaign Creator */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <img src={campaign?.creatorAvatar || '/placeholder-avatar.svg'} alt="Creator" />
                </Avatar>
                <div>
                  <p className="font-medium">{campaign?.creatorName}</p>
                  <p className="text-sm text-gray-600">Campaign Organizer</p>
                </div>
              </div>

              {/* Story Tabs */}
              <Tabs defaultValue="story" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="story" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Story
                  </TabsTrigger>
                  <TabsTrigger 
                    value="updates" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Updates
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comments" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Comments
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="story" className="mt-6">
                  <div className="prose max-w-none">
                    <p>{campaign?.description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="updates" className="mt-6">
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <p className="font-semibold">Campaign Update - January 2025</p>
                      <p className="text-gray-600 mt-2">
                        Thank you for your continued support. We've made significant progress...
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="comments" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-gray-600">No comments yet. Be the first to leave one!</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Donation Progress and Actions */}
            <div className="space-y-6">
              <div className="border rounded-lg p-6 space-y-6 sticky top-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>UGX {campaign?.raisedAmount?.toLocaleString() || '0'}</span>
                      <span>raised of UGX {campaign?.targetAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <Progress 
                      value={campaign?.targetAmount ? (campaign.raisedAmount / campaign.targetAmount) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{Math.ceil((new Date(campaign?.endDate || new Date()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white h-12 gap-2 text-lg font-semibold"
                    onClick={() => navigate(`/donate/${campaign.id}`)}
                  >
                    <Wallet2 className="w-5 h-5" />
                    Contribute now
                  </Button>

                  <Button 
                    className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsPledgeOpen(true)}
                  >
                    <CreditCard className="w-5 h-5" />
                    Pledge to donate
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant={isLoved ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => {
                        setIsLoved(!isLoved);
                        toast({
                          title: isLoved ? "Removed from favorites" : "Added to favorites",
                          description: isLoved ? "Campaign removed from your favorites" : "Campaign added to your favorites"
                        });
                      }}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isLoved ? "fill-current" : ""}`} />
                      Love
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{supporters} supporters</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{campaign?.location || 'Location not specified'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant={isFollowing ? "default" : "outline"}
                    className="w-full"
                    onClick={() => {
                      setIsFollowing(!isFollowing);
                      toast({
                        title: isFollowing ? "Unfollowed" : "Following",
                        description: isFollowing ? "You will no longer receive updates" : "You will receive updates about this campaign"
                      });
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow Campaign
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Contribute Dialog */}
      <ContributeForm
        open={isContributeOpen}
        onOpenChange={setIsContributeOpen}
        campaign={campaign}
      />

      {/* Pledge Dialog */}
      <PledgeForm
        open={isPledgeOpen}
        onOpenChange={setIsPledgeOpen}
        campaign={campaign}
      />
    </div>
  );
};

export default CampaignDetails;
