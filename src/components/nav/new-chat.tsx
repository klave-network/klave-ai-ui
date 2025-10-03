import { MessageCirclePlus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function NewChat() {
    return (
        <div className="px-4">
            <Button className="w-full">
                <MessageCirclePlus />
                {' '}
                New Chat
            </Button>
        </div>
    );
}
