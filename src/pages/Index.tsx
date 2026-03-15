import { useState } from 'react';
import { GameHeader } from '@/components/GameHeader';
import { FreelanceBoard } from '@/components/FreelanceBoard';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ReviewDialog } from '@/components/ReviewDialog';
import { ClientChatDrawer } from '@/components/ClientChatDrawer';
import { INITIAL_GAME_STATE, type FreelanceOrder, type GameState } from '@/lib/gameData';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [consultationCount, setConsultationCount] = useState(0);
  const [clientPreviewRating, setClientPreviewRating] = useState<number | null>(null);

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
    setGameState(prev => ({
      ...prev,
      balance: prev.balance + earned,
      reputation: prev.reputation + xp,
      completedOrders: prev.completedOrders + 1,
      currentOrder: null,
    }));
    setGeneratedHtml(null);
    setShowReview(false);
    setConsultationCount(0);
    setClientPreviewRating(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <GameHeader
        balance={gameState.balance}
        reputation={gameState.reputation}
        completedOrders={gameState.completedOrders}
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
    </div>
  );
};

export default Index;
