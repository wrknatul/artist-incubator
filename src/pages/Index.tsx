import { useState } from 'react';
import { GameHeader } from '@/components/GameHeader';
import { FreelanceBoard } from '@/components/FreelanceBoard';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ReviewDialog } from '@/components/ReviewDialog';
import { IntroCutscene } from '@/components/IntroCutscene';
import { PhoneMenu, type Expense } from '@/components/PhoneMenu';
import { FreelancerProfile } from '@/components/FreelancerProfile';
import { INITIAL_GAME_STATE, BASE_MONTHLY_EXPENSES, getAverageRating, type FreelanceOrder, type GameState, type CompletedReview } from '@/lib/gameData';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CHAT_CLIENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-client`;

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

  const handleIntroDone = () => {
    setGameState(prev => ({ ...prev, introDone: true }));
  };

  const getMonthlyExpenses = () => {
    let total = BASE_MONTHLY_EXPENSES;
    if (gameState.ownedItems.includes('cat')) total += 30;
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

  if (!gameState.introDone) {
    return <IntroCutscene onComplete={handleIntroDone} />;
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
      />

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
