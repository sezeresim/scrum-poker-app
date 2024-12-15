import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useGlobalContext } from '@/store/global/Global.context';
import LocalStore from '@/utils/localStore';
import { Check, Swords, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const { socket } = useGlobalContext();
  const [name, setName] = useState(LocalStore.GetName());
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempName(name);
  };

  const handleSave = () => {
    if (tempName.trim()) {
      setName(tempName);
      LocalStore.SaveName(tempName);
      setIsEditing(false);
      socket.emit('updateUser', {
        name: tempName,
        userId: LocalStore.GetUser(),
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempName(name);
  };
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <Swords className="h-6 w-6" />
              <span className="text-lg font-bold">Sword Estimator</span>
            </a>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          ref={inputRef}
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Button
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleSave}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCancel}
                          variant={'destructive'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-xs leading-none text-muted-foreground">
                          {name}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={handleEdit}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
