import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar, EmptyState, Spinner } from '@/components/ui/Primitives';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getSocket } from '@/lib/socket';
import { cn, timeAgo } from '@/lib/utils';
import type { Message } from '@/types';

interface ConversationSummary {
  _id: string;
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/messages').then(({ data }) => setConversations(data.data.conversations)).finally(() => setLoadingList(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoadingThread(true);
    api.get(`/messages/${userId}`).then(({ data }) => setMessages(data.data.messages)).finally(() => setLoadingThread(false));
  }, [userId]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket(user._id);
    const handler = (msg: Message) => {
      if (msg.sender === userId || msg.receiver === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('new_message', handler);
    return () => { socket.off('new_message', handler); };
  }, [user, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !userId) return;
    const { data } = await api.post('/messages', { receiverId: userId, text });
    setMessages((prev) => [...prev, data.data.message]);
    setText('');
  };

  return (
    <DashboardLayout title="Messages">
      <div className="grid h-[calc(100vh-8.5rem)] grid-cols-1 overflow-hidden rounded-2xl border border-ink/[0.06] bg-white sm:grid-cols-[280px_1fr]">
        {/* Conversation list */}
        <div className="hidden overflow-y-auto border-r border-ink/[0.06] sm:block">
          {loadingList ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : conversations.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-faint">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const otherId = c.lastMessage.sender === user?._id ? c.lastMessage.receiver : c.lastMessage.sender;
              return (
                <button
                  key={c._id}
                  onClick={() => navigate(`/messages/${otherId}`)}
                  className={cn('flex w-full items-center gap-3 border-b border-ink/[0.04] px-4 py-3.5 text-left hover:bg-ink/[0.02]', userId === otherId && 'bg-forest-50')}
                >
                  <Avatar name="U" size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{otherId}</p>
                    <p className="truncate text-xs text-ink-faint">{c.lastMessage.text}</p>
                  </div>
                  {c.unreadCount > 0 && <span className="h-2 w-2 rounded-full bg-brass-500" />}
                </button>
              );
            })
          )}
        </div>

        {/* Thread */}
        <div className="flex flex-col">
          {!userId ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState title="Select a conversation" description="Choose a conversation from the list, or contact a seller from a listing." />
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {loadingThread ? (
                  <div className="flex justify-center py-12"><Spinner /></div>
                ) : (
                  messages.map((m) => (
                    <div key={m._id} className={cn('flex', m.sender === user?._id ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-xs rounded-2xl px-4 py-2.5 text-sm', m.sender === user?._id ? 'bg-forest-600 text-white' : 'bg-ink/[0.05] text-ink')}>
                        <p>{m.text}</p>
                        <p className={cn('mt-1 text-[10px]', m.sender === user?._id ? 'text-forest-100/70' : 'text-ink-faint')}>{timeAgo(m.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-ink/[0.06] p-4">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-forest-500"
                />
                <button onClick={sendMessage} className="rounded-xl bg-forest-600 p-2.5 text-white hover:bg-forest-700" aria-label="Send">
                  <Send className="h-4.5 w-4.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
