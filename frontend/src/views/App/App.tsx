import { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { useGlobalContext } from '@/store/global/Global.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PlusCircle, LogIn } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import LocalStore from '@/utils/localStore';
import { v4 } from 'uuid';

export default function ScrumPoker() {
  const { socket } = useGlobalContext();
  const [roomId, setRoomId] = useState<string>('');
  const [userName, setUserName] = useState('');

  const navigate = useNavigate();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    LocalStore.SaveName(userName);
    socket.emit('createRoom', {
      userId: LocalStore.GetUser(),
      roomName: v4(),
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      LocalStore.SaveName(userName);
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 flex">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Scrum Estimation Tool
              </CardTitle>
              <CardDescription className="text-center">
                Create or join a room to start estimating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full text-lg py-6">
                    <PlusCircle className="mr-2 h-5 w-5" /> Create New Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Room</DialogTitle>
                    <DialogDescription>
                      Set up your new estimation room. Click create when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRoom}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="user-name" className="text-right">
                          Your Name
                        </Label>
                        <Input
                          id="user-name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={!userName.trim()}>
                        Create Room
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              <form onSubmit={handleJoinRoom}>
                <div className="space-y-2">
                  <Input
                    id="room-code"
                    placeholder="Enter room code"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                  <Input
                    id="user-name"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full mt-4 text-lg py-6"
                  disabled={!roomId.trim()}
                >
                  <LogIn className="mr-2 h-5 w-5" /> Join Room
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground">
              Join your team and start estimating user stories together!
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
