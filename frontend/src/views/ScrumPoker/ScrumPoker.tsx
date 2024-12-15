import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePokerContext, withPoker } from '@/store/poker/Poker.context';
import { VOTES } from '@/constant/votes';
import { Button } from '@/components/ui/button';

import RoomNotFound from '@/components/RoomNotFound/RoomNotFound';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Hourglass } from 'lucide-react';
import LocalStore from '@/utils/localStore';
import Layout from '@/components/Layout/Layout';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import clsx from 'clsx';

const ScrumPoker = () => {
  const { joinRoom, state, submitVote, showVotes, clearVotes } =
    usePokerContext();
  const params = useParams();

  const getUsername = () => {
    const name = LocalStore.GetName();
    if (!name) {
      return 'User' + Math.floor(Math.random() * 1000);
    }
    return name;
  };

  useEffect(() => {
    const username = getUsername();
    joinRoom({
      username: username,
      roomId: params.roomId as string,
    });
  }, []);

  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  const handleSelectPoint = (point: string) => {
    setSelectedPoint(point);
    submitVote({ vote: point });
  };
  const currentUserId = LocalStore.GetUser();

  const getChartData = () => {
    const voteCount: { [key: number]: number } = {};
    let totalVotes = 0;
    let sumVotes = 0;

    state.users.forEach((user) => {
      if (user.vote !== null) {
        voteCount[user.vote] = (voteCount[user.vote] || 0) + 1;
        totalVotes++;
        sumVotes += user.vote;
      }
    });

    const newChartData = Object.entries(voteCount).map(([vote, count]) => ({
      name: vote,
      count: count,
    }));

    return newChartData;
  };
  if (state.isError) {
    return <RoomNotFound />;
  }
  return (
    <Layout>
      {currentUserId === state.room?.adminId && (
        <Card className="mb-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Room Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="font-semibold text-sm">
              <p className="mb-1">
                Room Id:{' '}
                <span className="font-bold text-xs">{state.room.id}</span>
              </p>
              <p>
                Username:{' '}
                <span className="font-bold text-xs">{state.username}</span>
              </p>
              <p>
                Admin:{' '}
                <span className="font-bold text-xs">
                  {currentUserId === state.room?.adminId
                    ? 'You'
                    : state.users.find(
                        (user) => user.userId === state.room?.adminId,
                      )?.name}
                </span>
              </p>
              <p>
                User: <span className="font-bold text-xs">{currentUserId}</span>
              </p>
            </pre>
            <div className="flex mt-1 gap-2">
              <Button onClick={showVotes}>
                {state.room.votesVisible ? 'Hide Votes' : 'Show Votes'}
              </Button>
              <Button onClick={clearVotes} variant={'destructive'}>
                Clear Votes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {state.room.votesVisible && (
        <Card className="mb-2 transition-all duration-300 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Estimation Results
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Average Estimation</h3>
              <p className="text-3xl font-bold">
                {state.users.reduce((acc, user) => {
                  if (user.vote !== null) {
                    return acc + user.vote;
                  }
                  return acc;
                }, 0) / state.users.filter((user) => user.vote !== null).length}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Vote Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Participants</h3>
              <ul className="space-y-2">
                {state.users.map((user) => (
                  <li
                    key={user.id}
                    className="flex justify-between items-center"
                  >
                    <span>{user.name}</span>
                    <span className="font-semibold">
                      {user.vote !== null ? user.vote : 'Not voted'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Scrum Estimation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estimation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {VOTES.map((point) => (
                    <Button
                      key={point.id}
                      onClick={() => handleSelectPoint(point.id)}
                      disabled={selectedPoint === point.id}
                      variant={
                        selectedPoint === point.id ? 'default' : 'outline'
                      }
                      className="font-medium text-xl"
                    >
                      {point.text}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                  {state.users.map((user) => (
                    <div
                      key={user.id}
                      className={clsx(
                        'flex items-center p-2 mb-2 cursor-pointer rounded-md',
                        currentUserId === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                        user.isVoted ? 'bg-green-100' : 'bg-gray-100',
                      )}
                      onClick={() => console.log(user.id)}
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={
                            'https://api.dicebear.com/9.x/lorelei/svg?seed=' +
                            user.id
                          }
                          alt={user.name}
                        />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="flex-grow">{user.name}</span>
                      {user.isVoted ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Hourglass className="h-5 w-5 text-gray-400" />
                      )}
                      {state.room.votesVisible && user.vote}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default withPoker(ScrumPoker);
