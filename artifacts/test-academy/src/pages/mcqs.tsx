import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListMcqLevels,
  useListMcqQuestions,
  useCreateMcqQuestion,
  useUpdateMcqQuestion,
  useDeleteMcqQuestion,
  useSubmitMcqAnswers,
  useGetMe,
  getListMcqQuestionsQueryKey,
  getListMcqLevelsQueryKey,
} from "@workspace/api-client-react";
import type { McqQuestion, McqLevel } from "@workspace/api-client-react";
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
import { Plus, Edit, Trash2, ArrowLeft, CheckCircle, XCircle, FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.enum(["A", "B", "C", "D"], { required_error: "Correct answer is required" }),
});
type QuestionFormValues = z.infer<typeof questionSchema>;

export function Mcqs() {
  const { data: user } = useGetMe();
  const isAdmin = user?.role === "admin";
  const [selectedLevel, setSelectedLevel] = useState<McqLevel | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: levels, isLoading: levelsLoading } = useListMcqLevels();
  const { data: questions, isLoading: questionsLoading } = useListMcqQuestions(
    selectedLevel?.id ?? 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { enabled: !!selectedLevel } as any }
  );

  const submitMcq = useSubmitMcqAnswers();

  function handleStartQuiz() {
    setAnswers({});
    setSubmitted(null);
    setQuizMode(true);
  }

  function handleSelectAnswer(questionId: number, answer: string) {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }

  function handleSubmitQuiz() {
    if (!selectedLevel || !questions) return;
    const answerList = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: (answers[q.id] || "A") as "A" | "B" | "C" | "D",
    }));
    submitMcq.mutate(
      { data: { levelId: selectedLevel.id, answers: answerList } },
      {
        onSuccess: (result) => {
          setSubmitted(result);
          setQuizMode(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to submit answers.", variant: "destructive" });
        },
      }
    );
  }

  if (selectedLevel) {
    return (
      <LevelView
        level={selectedLevel}
        questions={questions ?? []}
        isLoading={questionsLoading}
        isAdmin={isAdmin}
        quizMode={quizMode}
        answers={answers}
        submitted={submitted}
        onBack={() => { setSelectedLevel(null); setQuizMode(false); setSubmitted(null); setAnswers({}); }}
        onStartQuiz={handleStartQuiz}
        onSelectAnswer={handleSelectAnswer}
        onSubmitQuiz={handleSubmitQuiz}
        submitting={submitMcq.isPending}
        queryClient={queryClient}
      />
    );
  }

  return (
    <div className="flex-1 bg-muted/10 pb-20">
      <div className="bg-primary text-primary-foreground py-16 mb-8 border-b-4 border-secondary">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight mb-2">MCQs Preparation</h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            100 levels of knowledge checks. Master each level to build your exam confidence.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {levelsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : !levels?.length ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-lg">
            <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary">No MCQ levels available yet.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level)}
                className={`group relative h-20 rounded-xl border-2 font-bold text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center gap-1 ${
                  level.questionCount >= 10
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : level.questionCount > 0
                    ? "border-secondary bg-secondary/10 text-primary hover:bg-secondary/20"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <span className="text-xs font-semibold opacity-70 tracking-widest uppercase">Lvl</span>
                <span className="text-xl font-black">{level.levelNumber}</span>
                {level.questionCount > 0 && (
                  <span className="text-xs opacity-70">{level.questionCount}/10</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-primary inline-block" /> Complete (10 questions)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-secondary/30 border border-secondary inline-block" /> Partial
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded border border-border inline-block" /> Empty
          </span>
        </div>
      </div>
    </div>
  );
}

function LevelView({
  level, questions, isLoading, isAdmin, quizMode, answers, submitted,
  onBack, onStartQuiz, onSelectAnswer, onSubmitQuiz, submitting, queryClient
}: {
  level: McqLevel;
  questions: McqQuestion[];
  isLoading: boolean;
  isAdmin: boolean;
  quizMode: boolean;
  answers: Record<number, string>;
  submitted: { score: number; total: number; percentage: number } | null;
  onBack: () => void;
  onStartQuiz: () => void;
  onSelectAnswer: (id: number, ans: string) => void;
  onSubmitQuiz: () => void;
  submitting: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const { toast } = useToast();
  const deleteQuestion = useDeleteMcqQuestion();

  function handleDelete(id: number) {
    deleteQuestion.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMcqQuestionsQueryKey(level.id) });
        queryClient.invalidateQueries({ queryKey: getListMcqLevelsQueryKey() });
        toast({ title: "Deleted", description: "Question removed." });
      },
    });
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex-1 bg-muted/10 pb-20">
      <div className="bg-primary text-primary-foreground py-16 mb-8 border-b-4 border-secondary">
        <div className="container mx-auto px-4">
          <button onClick={onBack} className="flex items-center gap-2 text-primary-foreground/70 hover:text-secondary mb-4 text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Levels
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold uppercase tracking-tight mb-1">Level {level.levelNumber}</h1>
              <p className="text-primary-foreground/70">{questions.length}/10 questions • {level.title}</p>
            </div>
            <div className="flex gap-3">
              {isAdmin && <QuestionAdminDialog levelId={level.id} queryClient={queryClient} />}
              {!isAdmin && questions.length > 0 && !quizMode && !submitted && (
                <Button onClick={onStartQuiz} variant="secondary" className="font-bold">
                  Start Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Quiz Result */}
        {submitted && (
          <Card className={`mb-8 border-2 ${submitted.percentage >= 70 ? "border-green-500 bg-green-50" : "border-destructive bg-red-50"}`}>
            <CardContent className="pt-6 text-center">
              {submitted.percentage >= 70
                ? <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                : <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              }
              <h2 className="text-2xl font-display font-bold mb-2">
                {submitted.percentage >= 70 ? "Excellent!" : "Keep Practicing"}
              </h2>
              <p className="text-lg font-semibold mb-4">
                {submitted.score}/{submitted.total} correct ({submitted.percentage.toFixed(0)}%)
              </p>
              <Button onClick={onStartQuiz} className="font-bold">Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* Quiz Mode */}
        {quizMode && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground text-sm">{answeredCount}/{questions.length} answered</p>
              <Button
                onClick={onSubmitQuiz}
                disabled={submitting || answeredCount === 0}
                className="font-bold"
              >
                {submitting ? "Submitting..." : "Submit Answers"}
              </Button>
            </div>
            {questions.map((q, idx) => (
              <Card key={q.id} className="overflow-hidden">
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
                          onClick={() => onSelectAnswer(q.id, opt)}
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
          </div>
        )}

        {/* Question list (admin/preview) */}
        {!quizMode && (
          isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />)}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-lg bg-white">
              <FileQuestion className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-primary font-medium">No questions added yet.</p>
              {isAdmin && <p className="text-sm text-muted-foreground mt-1">Use "Add Question" to add questions to this level.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card key={q.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-3 border-b">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base font-semibold text-primary">
                        Q{idx + 1}. {q.question}
                      </CardTitle>
                      {isAdmin && (
                        <div className="flex gap-2 shrink-0">
                          <QuestionAdminDialog levelId={level.id} questionToEdit={q} queryClient={queryClient} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(q.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const text = opt === "A" ? q.optionA : opt === "B" ? q.optionB : opt === "C" ? q.optionC : q.optionD;
                        const isCorrect = isAdmin && q.correctAnswer === opt;
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
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function QuestionAdminDialog({ levelId, questionToEdit, queryClient }: {
  levelId: number;
  questionToEdit?: McqQuestion;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createQ = useCreateMcqQuestion();
  const updateQ = useUpdateMcqQuestion();

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
          queryClient.invalidateQueries({ queryKey: getListMcqQuestionsQueryKey(levelId) });
          queryClient.invalidateQueries({ queryKey: getListMcqLevelsQueryKey() });
          toast({ title: "Updated", description: "Question updated." });
          setOpen(false);
        },
      });
    } else {
      createQ.mutate({ levelId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMcqQuestionsQueryKey(levelId) });
          queryClient.invalidateQueries({ queryKey: getListMcqLevelsQueryKey() });
          toast({ title: "Added", description: "Question added." });
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
