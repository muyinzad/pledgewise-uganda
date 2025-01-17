import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ItemFormProps {
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  title: string;
}

function ItemForm({ onSubmit, title }: ItemFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ name, description });
      setName("");
      setDescription("");
      toast({
        title: "Success",
        description: `${title} created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${title.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}

interface ItemListProps {
  items: Array<{ id: string; name: string; description?: string }>;
  onDelete: (id: string) => Promise<void>;
  title: string;
}

function ItemList({ items, onDelete, title }: ItemListProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await onDelete(id);
      toast({
        title: "Success",
        description: `${title} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${title.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">
          No {title.toLowerCase()}s found
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description || "-"}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive"
                          disabled={isDeleting === item.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {title}</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this {title.toLowerCase()}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ContributionsSection() {
  const { data: contributions = [] } = useQuery({
    queryKey: ["contributions"],
    queryFn: api.contributions.list,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contributions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No contributions found
              </TableCell>
            </TableRow>
          ) : (
            contributions.map((contribution: any) => (
              <TableRow key={contribution.id}>
                <TableCell className="font-medium">
                  {contribution.campaign.title}
                </TableCell>
                <TableCell>
                  UGX {contribution.amount?.toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(contribution.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    contribution.status === 'completed' 
                      ? 'bg-green-50 text-green-700'
                      : contribution.status === 'pending'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {contribution.status}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function UsersSection() {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: api.users.list,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.categories.list,
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: api.locations.list,
  });

  const handleCreateCategory = async (data: { name: string; description?: string }) => {
    await api.categories.create(data);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleCreateLocation = async (data: { name: string; description?: string }) => {
    await api.locations.create(data);
    queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  const handleDeleteCategory = async (id: string) => {
    await api.categories.delete(id);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleDeleteLocation = async (id: string) => {
    await api.locations.delete(id);
    queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      <Header />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your campaign categories, locations, and view contributions
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Categories Section */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage campaign categories that users can choose from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-4 w-full">Add New Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                  </DialogHeader>
                  <ItemForm onSubmit={handleCreateCategory} title="Category" />
                </DialogContent>
              </Dialog>
              <ItemList
                items={categories}
                onDelete={handleDeleteCategory}
                title="Category"
              />
            </CardContent>
          </Card>

          {/* Locations Section */}
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Manage available locations for campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-4 w-full">Add New Location</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Location</DialogTitle>
                  </DialogHeader>
                  <ItemForm onSubmit={handleCreateLocation} title="Location" />
                </DialogContent>
              </Dialog>
              <ItemList
                items={locations}
                onDelete={handleDeleteLocation}
                title="Location"
              />
            </CardContent>
          </Card>
        </div>

        {/* Contributions Section - Full Width */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Contributions</CardTitle>
            <CardDescription>
              View and manage all campaign contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContributionsSection />
          </CardContent>
        </Card>

        {/* Users Section - Full Width */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage system users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}