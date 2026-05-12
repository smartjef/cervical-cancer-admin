"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Local Textarea component to resolve module resolution issues
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
      {...props}
    />
  );
}

interface CompleteReferralDialogProps {
  referral: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CompleteReferralDialog({
  referral,
  open,
  onOpenChange,
  onSuccess,
}: CompleteReferralDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [completionForm, setCompletionForm] = useState({
    visitedDate: new Date().toISOString().split("T")[0],
    finalDiagnosis: "",
    outcomeNotes: "",
    tests: [{ testType: "VIA", testResult: "NEGATIVE", actionTaken: "TREATED" }],
  });

  const handleAddTest = () => {
    setCompletionForm({
      ...completionForm,
      tests: [
        ...completionForm.tests,
        { testType: "VIA", testResult: "NEGATIVE", actionTaken: "TREATED" },
      ],
    });
  };

  const handleRemoveTest = (index: number) => {
    const newTests = [...completionForm.tests];
    newTests.splice(index, 1);
    setCompletionForm({ ...completionForm, tests: newTests });
  };

  const handleTestChange = (index: number, field: string, value: string) => {
    const newTests = [...completionForm.tests];
    newTests[index] = { ...newTests[index], [field]: value };
    setCompletionForm({ ...completionForm, tests: newTests });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest(`/referrals/${referral.id}/complete`, {
        method: "POST",
        body: JSON.stringify({
          visitedDate: new Date(completionForm.visitedDate).toISOString(),
          finalDiagnosis: completionForm.finalDiagnosis,
          outcomeNotes: completionForm.outcomeNotes,
          tests: completionForm.tests,
        }),
      });

      toast({
        title: "Referral Completed",
        description: "The referral has been marked as complete with results.",
        variant: "success",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to complete referral:", error);
      toast({
        title: "Error",
        description: "Failed to update referral status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Complete Referral
          </DialogTitle>
          <DialogDescription className="font-medium">
            Record the outcome and test results for this referral visit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Visit Date
              </Label>
              <Input
                required
                type="date"
                value={completionForm.visitedDate}
                onChange={(e) =>
                  setCompletionForm({
                    ...completionForm,
                    visitedDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Final Diagnosis
              </Label>
              <Input
                placeholder="e.g. Normal, CIN 1, etc."
                value={completionForm.finalDiagnosis}
                onChange={(e) =>
                  setCompletionForm({
                    ...completionForm,
                    finalDiagnosis: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tests Performed
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-bold uppercase tracking-wider gap-1"
                onClick={handleAddTest}
              >
                <Plus className="h-3 w-3" /> Add Test
              </Button>
            </div>

            <div className="space-y-3">
              {completionForm.tests.map((test, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl border border-border/50 bg-muted/30"
                >
                  <div className="col-span-4 space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Test Type
                    </Label>
                    <Select
                      value={test.testType}
                      onValueChange={(val) =>
                        handleTestChange(index, "testType", val)
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIA">VIA</SelectItem>
                        <SelectItem value="PAP_SMEAR">Pap Smear</SelectItem>
                        <SelectItem value="HPV_TEST">HPV Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Result
                    </Label>
                    <Select
                      value={test.testResult}
                      onValueChange={(val) =>
                        handleTestChange(index, "testResult", val)
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEGATIVE">Negative</SelectItem>
                        <SelectItem value="POSITIVE">Positive</SelectItem>
                        <SelectItem value="SUSPICIOUS">Suspicious</SelectItem>
                        <SelectItem value="CYTOLOGY_POSITIVE">
                          Cytology Positive
                        </SelectItem>
                        <SelectItem value="CYTOLOGY_NEGATIVE">
                          Cytology Negative
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Action
                    </Label>
                    <Select
                      value={test.actionTaken || ""}
                      onValueChange={(val) =>
                        handleTestChange(index, "actionTaken", val)
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TREATED">Treated</SelectItem>
                        <SelectItem value="BIOPSY">Biopsy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 flex justify-end pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => handleRemoveTest(index)}
                      disabled={completionForm.tests.length === 1}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Outcome Notes
            </Label>
            <Textarea
              placeholder="Additional details about the visit..."
              className="min-h-[100px]"
              value={completionForm.outcomeNotes}
              onChange={(e) =>
                setCompletionForm({
                  ...completionForm,
                  outcomeNotes: e.target.value,
                })
              }
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Complete Referral"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
