import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListFinalTestQuestions,
  useCreateFinalTestQuestion,
  useUpdateFinalTestQuestion,
  useDeleteFinalTestQuestion,
  useSubmitFinalTest,
  useGetMe,
  getListFinalTestQuestionsQueryKey,
} from "@workspace/api-client-react";
import type { FinalTestQuestion } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Award, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.enum(["A", "B", "C", "D"], { required_error: "Correct answer is required" }),
});
type QuestionFormValues = z.infer<typeof questionSchema>;

export function FinalTest() {
  const { data: user } = useGetMe();
  const isAdmin = user?.role === "admin";
  const [testMode, setTestMode] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useListFinalTestQuestions(
    isAdmin ? { all: "true" } : undefined
  );
  const submitTest = useSubmitFinalTest();

  function handleStartTest() {
    setAnswers({});
    setResult(null);
    setTestMode(true);
  }

  function handleSelectAnswer(questionId: number, answer: string) {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }

  function handleSubmit() {
    if (!questions || !user) return;
    const studentName = user.name ?? user.email ?? "Student";
    const answerList = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: (answers[q.id] || "A") as "A" | "B" | "C" | "D",
    }));
    submitTest.mutate(
      { data: { studentName, answers: answerList } },
      {
        onSuccess: (res) => {
          setResult(res);
          setTestMode(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to submit test.", variant: "destructive" });
        },
      }
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions?.length ?? 0;

  return (
    <div className="flex-1 bg-muted/10 pb-20">
      <div className="bg-primary text-primary-foreground py-16 mb-8 border-b-4 border-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold uppercase tracking-tight mb-2">Final Test</h1>
              <p className="text-primary-foreground/80 max-w-2xl">
                Comprehensive final assessment covering all preparation modules.
              </p>
            </div>
            {isAdmin && (
              <QuestionAdminDialog queryClient={queryClient} />
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Result card */}
        {result && (
          <Card className={`mb-8 border-2 ${result.percentage >= 70 ? "border-green-500 bg-green-50" : "border-destructive bg-red-50"}`}>
            <CardContent className="pt-8 pb-8 text-center">
              {result.percentage >= 70
                ? <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                : <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              }
              <h2 className="text-3xl font-display font-bold mb-2">
                {result.percentage >= 70 ? "Congratulations!" : "Keep Studying!"}
              </h2>
              <p className="text-2xl font-semibold mb-2">
                {result.score} / {result.total}
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                {result.percentage.toFixed(1)}% — {result.percentage >= 70 ? "Passed" : "Failed"}
              </p>
              <Progress value={result.percentage} className="mb-6 h-3" />
              <Button onClick={handleStartTest} className="font-bold px-8">Retake Test</Button>
            </CardContent>
          </Card>
        )}

        {/* Test intro / start */}
        {!testMode && !result && (
          <Card className="mb-8 border-b-4 border-secondary shadow-lg">
            <CardContent className="pt-8 pb-8 text-center">
              <Award className="w-14 h-14 text-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-primary mb-2">Ready for the Final Test?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {totalQuestions > 0
                  ? `${totalQuestions} questions covering all modules. Answer all questions and submit when done.`
                  : "No questions have been added yet. Check back later."}
              </p>
              {totalQuestions > 0 && !isAdmin && (
                <Button onClick={handleStartTest} size="lg" className="font-bold px-10">
                  Start Final Test
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active test */}
        {testMode && questions && (
          <div className="space-y-6">
            <div className="sticky top-20 z-20 bg-card border rounded-xl px-5 py-3 shadow-md flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-primary">{answeredCount}/{totalQuestions} answered</span>
                  <span className="text-muted-foreground">{((answeredCount / totalQuestions) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitTest.isPending || answeredCount === 0}
                className="font-bold shrink-0"
              >
                {submitTest.isPending ? "Submitting..." : "Submit Test"}
              </Button>
            </div>

            {questions.map((q, idx) => (
              <Card key={q.id} className={`overflow-hidden transition-all ${answers[q.id] ? "border-primary/30" : "border-border"}`}>
                <CardHeader className="bg-muted/30 pb-3 border-b">
                  <CardTitle className="text-base font-semibold text-primary">
                    Q{idx + 1}. {q.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const text = opt === "A" ? q.optionA : opt === "B" ? q.optionB : opt === "C" ? q.optionC : q.optionD;
                      const selected = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectAnswer(q.id, opt)}
                          className={`text-left px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <span className={`font-bold mr-2 ${selected ? "text-secondary" : "text-primary"}`}>{opt}.</span>
                          {text}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmit}
                size="lg"
                disabled={submitTest.isPending || answeredCount === 0}
                className="font-bold px-12"
              >
                {submitTest.isPending ? "Submitting..." : "Submit Final Test"}
              </Button>
            </div>
          </div>
        )}

        {/* Admin question list */}
        {isAdmin && !testMode && (
          <div className="mt-4 space-y-4">
            <h2 className="text-xl font-display font-bold text-primary border-b pb-2">
              Questions ({totalQuestions})
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted/50 rounded-lg animate-pulse" />)}
              </div>
            ) : questions?.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No questions added yet. Use "Add Question" above.</p>
              </div>
            ) : (
              questions?.map((q, idx) => (
                <AdminQuestionCard key={q.id} question={q} index={idx} queryClient={queryClient} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminQuestionCard({ question, index, queryClient }: {
  question: FinalTestQuestion;
  index: number;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const { toast } = useToast();
  const deleteQ = useDeleteFinalTestQuestion();

  function handleDelete() {
    deleteQ.mutate({ id: question.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFinalTestQuestionsQueryKey() });
        toast({ title: "Deleted", description: "Question removed." });
      },
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-3 border-b">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold text-primary">
            Q{index + 1}. {question.question}
          </CardTitle>
          <div className="flex gap-2 shrink-0">
            <QuestionAdminDialog questionToEdit={question} queryClient={queryClient} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {(["A", "B", "C", "D"] as const).map((opt) => {
            const text = opt === "A" ? question.optionA : opt === "B" ? question.optionB : opt === "C" ? question.optionC : question.optionD;
            const isCorrect = question.correctAnswer === opt;
            return (
              <div key={opt} className={`px-3 py-2 rounded border ${isCorrect ? "border-green-500 bg-green-50 text-green-800 font-semibold" : "border-border bg-muted/30"}`}>
                <span className="font-bold mr-2">{opt}.</span>{text}
                {isCorrect && <Badge className="ml-2 text-xs bg-green-600">Correct</Badge>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionAdminDialog({ questionToEdit, queryClient }: {
  questionToEdit?: FinalTestQuestion;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createQ = useCreateFinalTestQuestion();
  const updateQ = useUpdateFinalTestQuestion();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: questionToEdit
      ? {
          question: questionToEdit.question,
          optionA: questionToEdit.optionA,
          optionB: questionToEdit.optionB,
          optionC: questionToEdit.optionC,
          optionD: questionToEdit.optionD,
          correctAnswer: questionToEdit.correctAnswer as "A" | "B" | "C" | "D",
        }
      : { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" },
  });

  function onSubmit(data: QuestionFormValues) {
    if (questionToEdit) {
      updateQ.mutate({ id: questionToEdit.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFinalTestQuestionsQueryKey() });
          toast({ title: "Updated", description: "Question updated." });
          setOpen(false);
        },
      });
    } else {
      createQ.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFinalTestQuestionsQueryKey() });
          toast({ title: "Added", description: "Question added to Final Test." });
          form.reset();
          setOpen(false);
        },
      });
    }
  }

  const isPending = createQ.isPending || updateQ.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {questionToEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="secondary" size="sm" className="font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{questionToEdit ? "Edit Question" : "Add Question"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="question" render={({ field }) => (
              <FormItem>
                <FormLabel>Question</FormLabel>
                <FormControl><Textarea rows={3} placeholder="Enter the question..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {(["A", "B", "C", "D"] as const).map((opt) => (
              <FormField key={opt} control={form.control} name={`option${opt}` as keyof QuestionFormValues} render={({ field }) => (
                <FormItem>
                  <FormLabel>Option {opt}</FormLabel>
                  <FormControl><Input placeholder={`Option ${opt}`} {...field} value={field.value as string} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ))}
            <FormField control={form.control} name="correctAnswer" render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["A", "B", "C", "D"].map(o => <SelectItem key={o} value={o}>Option {o}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 font-bold" disabled={isPending}>
                {isPending ? "Saving..." : questionToEdit ? "Update" : "Add Question"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
