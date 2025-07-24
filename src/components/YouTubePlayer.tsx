import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { cn } from "@/lib/utils";

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
  onReady?: (event: any) => void;
  onEnd?: (event: any) => void;
  onPlay?: (event: any) => void;
  onPause?: (event: any) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  className,
  onReady,
  onEnd,
  onPlay,
  onPause,
}) => {
  const opts: YouTubeProps['opts'] = {
    height: '480',
    width: '854',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      fs: 1,
      cc_load_policy: 0,
      iv_load_policy: 3,
      modestbranding: 1,
    },
  };

  const onPlayerReady = (event: any) => {
    onReady?.(event);
  };

  const onPlayerEnd = (event: any) => {
    onEnd?.(event);
  };

  const onPlayerPlay = (event: any) => {
    onPlay?.(event);
  };

  const onPlayerPause = (event: any) => {
    onPause?.(event);
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 rounded-lg overflow-hidden shadow-lg">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onPlayerReady}
            onEnd={onPlayerEnd}
            onPlay={onPlayerPlay}
            onPause={onPlayerPause}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};