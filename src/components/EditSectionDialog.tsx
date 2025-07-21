
import { useState, useEffect } from "react";
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
import { useUpdateSection, UpdateSectionData, SectionDetail } from "@/hooks/useSections";

const updateSectionSchema = z.object({
  SectionTitle: z.string().min(1, "Section title is required").max(100, "Section title must be less than 100 characters"),
  Description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
});

interface EditSectionDialogProps {
  spaceId: string;
  courseId: string;
  sectionId: string;
  section: SectionDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionUpdated: () => void;
}

export default function EditSectionDialog({
  spaceId,
  courseId,
  sectionId,
  section,
  open,
  onOpenChange,
  onSectionUpdated,
}: EditSectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateSection } = useUpdateSection(spaceId, courseId, sectionId);

  const form = useForm<UpdateSectionData>({
    resolver: zodResolver(updateSectionSchema),
    defaultValues: {
      SectionTitle: "",
      Description: "",
    },
  });

  // Update form values when section changes
  useEffect(() => {
    if (section) {
      form.reset({
        SectionTitle: section.SectionTitle,
        Description: section.Description,
      });
    }
  }, [section, form]);

  const onSubmit = async (data: UpdateSectionData) => {
    try {
      setIsSubmitting(true);
      await updateSection(data);
      onOpenChange(false);
      onSectionUpdated();
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
          <DialogTitle className="font-lexend">Edit Section</DialogTitle>
          <DialogDescription className="font-lexend">
            Update the section details below.
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
                {isSubmitting ? "Updating..." : "Update Section"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
