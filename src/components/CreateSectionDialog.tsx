
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateSection, CreateSectionData } from "@/hooks/useSections";

const createSectionSchema = z.object({
  SectionTitle: z.string().min(1, "Section title is required").max(100, "Section title must be less than 100 characters"),
  Description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
});

interface CreateSectionDialogProps {
  spaceId: string;
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionCreated: () => void;
}

export default function CreateSectionDialog({
  spaceId,
  courseId,
  open,
  onOpenChange,
  onSectionCreated,
}: CreateSectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSection } = useCreateSection(spaceId, courseId);

  const form = useForm<CreateSectionData>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      SectionTitle: "",
      Description: "",
    },
  });

  const onSubmit = async (data: CreateSectionData) => {
    try {
      setIsSubmitting(true);
      await createSection(data);
      form.reset();
      onOpenChange(false);
      onSectionCreated();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-lexend">Create New Section</DialogTitle>
          <DialogDescription className="font-lexend">
            Add a new section to this course. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="SectionTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-lexend">Section Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter section title"
                      className="font-lexend"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="Description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-lexend">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter section description"
                      className="font-lexend min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="font-lexend"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="font-lexend"
              >
                {isSubmitting ? "Creating..." : "Create Section"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
