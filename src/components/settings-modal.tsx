import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

export const SettingsModal = () => {
    return (
        <Dialog>
            <DialogTrigger asChild className="ml-auto">
                <Button
                    size="icon"
                    variant="outline"
                    className="hover:cursor-pointer"
                >
                    <Settings2 className="text-gray-500" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Customize</DialogTitle>
                    <DialogDescription>
                        Configure your settings here.
                    </DialogDescription>
                </DialogHeader>
                <form>
                    <div className="grid gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="system-prompt">System prompt</Label>
                            <Input
                                id="system-prompt"
                                placeholder="Enter your system prompt"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="temperature">Temperature</Label>
                            <Slider
                                id="temperature"
                                min={0}
                                max={2}
                                step={0.01}
                                defaultValue={[0.8]}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="topp">Top-p</Label>
                            <Slider
                                id="topp"
                                min={0}
                                max={1}
                                step={0.1}
                                defaultValue={[0.9]}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="steps">Steps</Label>
                            <Select defaultValue="256">
                                <SelectTrigger>
                                    <SelectValue
                                        id="steps"
                                        placeholder="Steps"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="256">256</SelectItem>
                                        <SelectItem value="512">512</SelectItem>
                                        <SelectItem value="1024">
                                            1024
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sliding-window">
                                Sliding window
                            </Label>
                            <Switch id="sliding-window" />
                        </div>
                        <div className="grid gap-3">
                            <Label>Add new RAG document</Label>
                            Upload RAG document
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="use-rag-document">
                                Use RAG document
                            </Label>
                            <Switch id="use-rag-document" />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
