import { useState } from 'react';
import { GameHeader } from '@/components/GameHeader';
import { FreelanceBoard } from '@/components/FreelanceBoard';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ReviewDialog } from '@/components/ReviewDialog';

import { IntroCutscene } from '@/components/IntroCutscene';
import { PhoneMenu, type Expense } from '@/components/PhoneMenu';
import { INITIAL_GAME_STATE, BASE_MONTHLY_EXPENSES, type FreelanceOrder, type GameState } from '@/lib/gameData';
import { toast } from 'sonner';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [consultationCount, setConsultationCount] = useState(0);
  const [clientPreviewRating, setClientPreviewRating] = useState<number | null>(null);

  const handleIntroDone = () => {
    setGameState(prev => ({ ...prev, introDone: true }));
  };

  const getMonthlyExpenses = () => {
    let total = BASE_MONTHLY_EXPENSES;
    if (gameState.ownedItems.includes('cat')) total += 30;
    return total;
  };

  const handleAcceptOrder = (order: FreelanceOrder) => {
    setGameState(prev => ({ ...prev, currentOrder: order }));
    setGeneratedHtml(null);
    setShowReview(false);
    setConsultationCount(0);
    setClientPreviewRating(null);
  };

  const handleSubmitProject = () => {
    setShowReview(true);
  };

  const handleClientPreview = (rating: number | null) => {
    setConsultationCount(prev => prev + 1);
    if (rating !== null) {
      setClientPreviewRating(rating);
    }
  };

  const handleReviewClose = (earned: number, xp: number) => {
    const expenses = getMonthlyExpenses();
    const netEarned = earned - expenses;

    setGameState(prev => ({
      ...prev,
      balance: prev.balance + netEarned,
      reputation: prev.reputation + xp,
      completedOrders: prev.completedOrders + 1,
      currentOrder: null,
      month: prev.month + 1,
    }));
    setGeneratedHtml(null);
    setShowReview(false);
    setConsultationCount(0);
    setClientPreviewRating(null);

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

  // Show intro cutscene
  if (!gameState.introDone) {
    return <IntroCutscene onComplete={handleIntroDone} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <GameHeader
        balance={gameState.balance}
        reputation={gameState.reputation}
        completedOrders={gameState.completedOrders}
        month={gameState.month}
        monthlyExpenses={getMonthlyExpenses()}
      />

      {gameState.currentOrder ? (
        <>
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

          <ClientChatDrawer
            order={gameState.currentOrder}
            generatedHtml={generatedHtml}
            onClientPreview={handleClientPreview}
            consultationCount={consultationCount}
          />
        </>
      ) : (
        <FreelanceBoard onAcceptOrder={handleAcceptOrder} />
      )}

      {showReview && gameState.currentOrder && (
        <ReviewDialog
          budget={gameState.currentOrder.budget}
          clientName={gameState.currentOrder.clientName}
          clientAvatar={gameState.currentOrder.clientAvatar}
          consultationCount={consultationCount}
          clientPreviewRating={clientPreviewRating}
          onClose={handleReviewClose}
        />
      )}

      <PhoneMenu
        balance={gameState.balance}
        monthlyExpenses={getMonthlyExpenses()}
        ownedItems={gameState.ownedItems}
        onPurchase={handlePurchase}
      />
    </div>
  );
};

export default Index;
