import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/GameHeader';
import { FreelanceBoard } from '@/components/FreelanceBoard';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ReviewDialog } from '@/components/ReviewDialog';
import { IntroCutscene } from '@/components/IntroCutscene';
import { StudioCutscene } from '@/components/StudioCutscene';
import { HiringWindow } from '@/components/HiringWindow';
import { PhoneMenu, type Expense } from '@/components/PhoneMenu';
import { FreelancerProfile } from '@/components/FreelancerProfile';
import { INITIAL_GAME_STATE, BASE_MONTHLY_EXPENSES, STUDIO_UNLOCK_BALANCE, getAverageRating, type FreelanceOrder, type GameState, type CompletedReview } from '@/lib/gameData';
import { generateCandidatePool, type EmployeeCandidate, type HiredEmployee, getEmployeeEffects } from '@/lib/hiringSystem';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CHAT_CLIENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-client`;

const MESSAGE_LIMITS: Record<string, number> = {
  easy: 5,
  medium: 3,
  hard: 2,
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [consultationCount, setConsultationCount] = useState(0);
  const [clientPreviewRating, setClientPreviewRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalAiRating, setFinalAiRating] = useState<number | null>(null);
  const [finalAiComment, setFinalAiComment] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showStudioCutscene, setShowStudioCutscene] = useState(false);
  const [showHiring, setShowHiring] = useState(false);
  // Check for studio unlock
  useEffect(() => {
    if (
      gameState.balance >= STUDIO_UNLOCK_BALANCE &&
      !gameState.studioUnlocked &&
      !showStudioCutscene &&
      gameState.introDone
    ) {
      setShowStudioCutscene(true);
    }
  }, [gameState.balance, gameState.studioUnlocked, gameState.introDone]);

  const handleStudioCutsceneDone = () => {
    setShowStudioCutscene(false);
    setGameState(prev => ({
      ...prev,
      studioUnlocked: true,
      studioCutsceneDone: true,
      candidatePool: generateCandidatePool(8),
    }));
    toast.success('🏢 Студия открыта! Загляни во вкладку «Наём» в телефоне.');
  };

  const handleIntroDone = () => {
    setGameState(prev => ({ ...prev, introDone: true }));
  };

  const getMonthlyExpenses = () => {
    let total = BASE_MONTHLY_EXPENSES;
    if (gameState.ownedItems.includes('cat')) total += 30;
    // Add employee salaries
    const effects = getEmployeeEffects(gameState.employees);
    total += effects.totalSalaries;
    return total;
  };

  const handleAcceptOrder = (order: FreelanceOrder) => {
    setGameState(prev => ({ ...prev, currentOrder: order, negotiatedBudget: null }));
    setGeneratedHtml(null);
    setShowReview(false);
    setConsultationCount(0);
    setClientPreviewRating(null);
    setFinalAiRating(null);
    setFinalAiComment(null);
  };

  const handleSubmitProject = async () => {
    if (!gameState.currentOrder || !generatedHtml) return;

    setIsSubmitting(true);

    try {
      const order = gameState.currentOrder;
      const resp = await fetch(CHAT_CLIENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          clientName: order.clientName,
          clientAvatar: order.clientAvatar,
          orderDescription: order.description,
          orderPrompt: order.prompt,
          clientProfile: order.clientProfile || null,
          hiddenRequirements: order.clientProfile?.hiddenRequirements || [],
          previewHtml: generatedHtml,
          messages: [
            { role: 'user', content: 'Проект готов! Вот финальная версия сайта. Оцените, пожалуйста.' },
          ],
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setFinalAiRating(data.rating ?? null);
        setFinalAiComment(data.message ?? null);
      }
    } catch (e) {
      console.error('Failed to get AI review:', e);
    } finally {
      setIsSubmitting(false);
      setShowReview(true);
    }
  };

  const handleClientPreview = (rating: number | null) => {
    setConsultationCount(prev => prev + 1);
    if (rating !== null) {
      setClientPreviewRating(rating);
    }
  };

  const handleBargainResult = (newBudget: number) => {
    setGameState(prev => ({ ...prev, negotiatedBudget: newBudget }));
    toast.success(`💰 Бюджет повышен до $${newBudget}!`);
  };

  const handleReviewClose = (earned: number, xp: number, reviewText: string, rating: number) => {
    const expenses = getMonthlyExpenses();
    const netEarned = earned - expenses;

    const newReview: CompletedReview = {
      clientName: gameState.currentOrder?.clientName || '',
      clientAvatar: gameState.currentOrder?.clientAvatar || '',
      orderTitle: gameState.currentOrder?.title || '',
      rating,
      text: reviewText,
      earned,
      month: gameState.month,
    };

    setGameState(prev => ({
      ...prev,
      balance: prev.balance + netEarned,
      reputation: prev.reputation + xp,
      completedOrders: prev.completedOrders + 1,
      currentOrder: null,
      month: prev.month + 1,
      negotiatedBudget: null,
      reviews: [...prev.reviews, newReview],
    }));
    setGeneratedHtml(null);
    setShowReview(false);
    setConsultationCount(0);
    setClientPreviewRating(null);
    setFinalAiRating(null);
    setFinalAiComment(null);

    if (netEarned > 0) {
      toast.success(`+$${earned} за заказ, -$${expenses} расходы = $${netEarned} чистыми`);
    } else {
      toast.error(`+$${earned} за заказ, -$${expenses} расходы = -$${Math.abs(netEarned)} убыток!`);
    }
  };

  const handlePurchase = (item: Expense) => {
    if (gameState.balance < item.cost) return;
    setGameState(prev => ({
      ...prev,
      balance: prev.balance - item.cost,
      ownedItems: [...prev.ownedItems, item.id],
    }));
    toast.success(`${item.emoji} ${item.name} куплен!`);
  };

  const handleHire = (candidate: EmployeeCandidate, salary: number) => {
    const newEmployee: HiredEmployee = {
      id: candidate.id,
      name: candidate.name,
      avatar: candidate.avatar,
      role: candidate.role,
      skills: candidate.skills,
      personality: candidate.personality,
      salary,
      hiredAt: gameState.month,
      morale: 8,
      productivity: 80,
      quitRisk: 5,
      conflictsWith: [],
    };
    setGameState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmployee],
      candidatePool: prev.candidatePool.filter(c => c.id !== candidate.id),
    }));
  };

  const handleRefreshCandidates = () => {
    setGameState(prev => ({
      ...prev,
      candidatePool: generateCandidatePool(8),
    }));
    toast.info('🔄 Новые кандидаты на бирже!');
  };

  if (!gameState.introDone) {
    return <IntroCutscene onComplete={handleIntroDone} />;
  }

  if (showStudioCutscene) {
    return <StudioCutscene onComplete={handleStudioCutsceneDone} />;
  }

  const avgRating = getAverageRating(gameState.reviews);

  return (
    <div className="h-screen flex flex-col">
      <GameHeader
        balance={gameState.balance}
        reputation={gameState.reputation}
        completedOrders={gameState.completedOrders}
        month={gameState.month}
        monthlyExpenses={getMonthlyExpenses()}
        averageRating={avgRating}
        onProfileClick={() => setShowProfile(true)}
      />

      {gameState.currentOrder ? (
        <div className="flex-1 flex min-h-0">
          <div className="w-[380px] min-w-[320px]">
            <ChatPanel
              order={gameState.currentOrder}
              onHtmlGenerated={setGeneratedHtml}
              onSubmitProject={handleSubmitProject}
              maxMessages={
                (MESSAGE_LIMITS[gameState.currentOrder.difficulty] || 3) +
                getEmployeeEffects(gameState.employees).bonusMessages
              }
            />
          </div>
          <PreviewPanel html={generatedHtml} />
        </div>
      ) : (
        <FreelanceBoard onAcceptOrder={handleAcceptOrder} />
      )}

      {/* Submitting overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border rounded-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-mono text-sm text-foreground">Заказчик смотрит вашу работу...</p>
            <p className="text-xs text-muted-foreground">Анализирует сайт и готовит оценку</p>
          </div>
        </div>
      )}

      {showReview && gameState.currentOrder && gameState.currentOrder.clientProfile && (
        <ReviewDialog
          budget={gameState.currentOrder.budget}
          negotiatedBudget={gameState.negotiatedBudget}
          clientName={gameState.currentOrder.clientName}
          clientAvatar={gameState.currentOrder.clientAvatar}
          consultationCount={consultationCount}
          clientPreviewRating={clientPreviewRating}
          clientProfile={gameState.currentOrder.clientProfile}
          finalAiRating={finalAiRating}
          finalAiComment={finalAiComment}
          onClose={handleReviewClose}
        />
      )}

      <PhoneMenu
        balance={gameState.balance}
        monthlyExpenses={getMonthlyExpenses()}
        ownedItems={gameState.ownedItems}
        onPurchase={handlePurchase}
        currentOrder={gameState.currentOrder}
        generatedHtml={generatedHtml}
        onClientPreview={handleClientPreview}
        consultationCount={consultationCount}
        onBargainResult={handleBargainResult}
        averageRating={avgRating}
        studioUnlocked={gameState.studioUnlocked}
        employees={gameState.employees}
        onOpenHiring={() => setShowHiring(true)}
        onAdminAddMoney={(amount) => {
          setGameState(prev => ({ ...prev, balance: prev.balance + amount }));
          toast.success(`🛠️ +$${amount} начислено`);
        }}
        onAdminUnlockStudio={() => {
          setGameState(prev => ({
            ...prev,
            studioUnlocked: true,
            studioCutsceneDone: true,
            candidatePool: prev.candidatePool.length > 0 ? prev.candidatePool : generateCandidatePool(8),
          }));
          toast.success('🏢 Студия разблокирована!');
        }}
      />


      {showHiring && gameState.studioUnlocked && (
        <HiringWindow
          candidates={gameState.candidatePool}
          employees={gameState.employees}
          balance={gameState.balance}
          onHire={handleHire}
          onRefreshCandidates={handleRefreshCandidates}
          onClose={() => setShowHiring(false)}
        />
      )}

      {showProfile && (
        <FreelancerProfile
          completedOrders={gameState.completedOrders}
          reputation={gameState.reputation}
          balance={gameState.balance}
          month={gameState.month}
          reviews={gameState.reviews}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default Index;
