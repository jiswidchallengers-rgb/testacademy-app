import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListEligibility, 
  useCreateEligibility, 
  useUpdateEligibility, 
  useDeleteEligibility, 
  usePublishEligibility,
  useGetMe,
  getListEligibilityQueryKey
} from "@workspace/api-client-react";
import type { EligibilityItem } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export function Eligibility() {
  const { data: user } = useGetMe();
  const isAdmin = user?.role === "admin";
  
  const { data: items, isLoading } = useListEligibility(isAdmin ? { all: "true" } : undefined);
  
  const grouped = items?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="flex-1 bg-muted/10 pb-20">
      <div className="bg-primary text-primary-foreground py-16 mb-8 border-b-4 border-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold uppercase tracking-tight mb-2">Eligibility Criteria</h1>
              <p className="text-primary-foreground/80 max-w-2xl">
                Review the strict physical, educational, and age requirements required for Civil Service.
              </p>
            </div>
            {isAdmin && <EligibilityAdminDialog />}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2].map(i => (
              <Card key={i} className="animate-pulse h-48 bg-muted/50"></Card>
            ))}
          </div>
        ) : !items?.length ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-lg">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary">No guidelines published yet.</h3>
            {isAdmin && <p className="text-sm text-muted-foreground mt-2">Click 'Add New Criterion' to get started.</p>}
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped || {}).map(([category, catItems]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-wider border-b-2 border-secondary pb-2 inline-block">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catItems.map((item) => (
                    <Card key={item.id} className={`overflow-hidden border-l-4 ${item.isPublished ? 'border-l-primary' : 'border-l-muted-foreground opacity-70'}`}>
                      <CardHeader className="bg-muted/30 pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="text-lg text-primary">{item.title}</CardTitle>
                          {isAdmin && <AdminControls item={item} />}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EligibilityAdminDialog({ itemToEdit }: { itemToEdit?: EligibilityItem }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createMut = useCreateEligibility();
  const updateMut = useUpdateEligibility();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: itemToEdit?.category || "",
      title: itemToEdit?.title || "",
      content: itemToEdit?.content || "",
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (itemToEdit) {
      updateMut.mutate({ id: itemToEdit.id, data }, {
        onSuccess: () => {
          toast({ title: "Updated successfully" });
          queryClient.invalidateQueries({ queryKey: getListEligibilityQueryKey({ all: "true" }) });
          setOpen(false);
        }
      });
    } else {
      createMut.mutate({ data: { ...data, isPublished: false } }, {
        onSuccess: () => {
          toast({ title: "Created successfully" });
          queryClient.invalidateQueries({ queryKey: getListEligibilityQueryKey({ all: "true" }) });
          setOpen(false);
          form.reset();
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {itemToEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10">
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="secondary" className="font-bold shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Add New Criterion
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{itemToEdit ? "Edit Criterion" : "Add New Criterion"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl><Input placeholder="e.g. Physical Standards" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="e.g. Minimum Height" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl><Textarea rows={4} placeholder="Details..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={createMut.isPending || updateMut.isPending}>
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AdminControls({ item }: { item: EligibilityItem }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const delMut = useDeleteEligibility();
  const pubMut = usePublishEligibility();

  const togglePublish = () => {
    pubMut.mutate({ id: item.id, data: { isPublished: !item.isPublished } }, {
      onSuccess: () => {
        toast({ title: item.isPublished ? "Unpublished" : "Published" });
        queryClient.invalidateQueries({ queryKey: getListEligibilityQueryKey({ all: "true" }) });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this?")) {
      delMut.mutate({ id: item.id }, {
        onSuccess: () => {
          toast({ title: "Deleted" });
          queryClient.invalidateQueries({ queryKey: getListEligibilityQueryKey({ all: "true" }) });
        }
      });
    }
  };

  return (
    <div className="flex items-center gap-1 bg-white p-1 rounded-md shadow-sm border">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={togglePublish} 
        className={`h-8 w-8 ${item.isPublished ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground hover:text-foreground'}`}
        title={item.isPublished ? "Unpublish" : "Publish"}
      >
        {item.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </Button>
      <EligibilityAdminDialog itemToEdit={item} />
      <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
