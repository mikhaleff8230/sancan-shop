import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/data/client';
import { useMe } from '@/data/user';
import { useModalAction } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import { CommentIcon } from '@/components/icons/comment-icon';
import { PaperPlaneIcon } from '@/components/icons/paper-plane-icon';
import toast from 'react-hot-toast';

interface Props { shopId?: string|number; variant?:'icon'|'button'; className?:string }
export default function ChatButton({shopId,variant='button',className=''}:Props){
 const router=useRouter(),{isAuthorized}=useMe(),{openModal}=useModalAction(),queryClient=useQueryClient();
 const create=useMutation((id:string)=>client.chat.createConversation(id),{onSuccess:(response:any)=>{queryClient.invalidateQueries(['chat-conversations']);const conversationId=response?.id||response?.data?.id||response?.conversation?.id;if(conversationId)router.push(`/chat?id=${conversationId}`);else toast.error('Не удалось открыть диалог');},onError:(error:any)=>toast.error(error?.response?.data?.message||'Не удалось открыть чат')});
 const click=()=>{if(!isAuthorized){openModal('LOGIN_VIEW');return;}if(!shopId){router.push('/chat');return;}create.mutate(String(shopId));};
 if(variant==='icon')return <Button type="button" variant="icon" aria-label="Написать продавцу" className={className} onClick={click}><CommentIcon className="h-5 w-5"/></Button>;
 return <Button type="button" className={className} onClick={click} disabled={create.isLoading}><PaperPlaneIcon className="h-4 w-4 mr-2"/>{create.isLoading?'Открываем…':'Написать продавцу'}</Button>;
}
