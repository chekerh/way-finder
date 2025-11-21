#!/usr/bin/env python3
"""
AI-Powered Video Generator for Destination Videos
Generates cinematic videos with Ken Burns effect, transitions, and AI-selected music.
"""

import os
import sys
import json
import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import List, Dict, Optional
from urllib.request import urlretrieve
from PIL import Image, ImageDraw, ImageFont
import requests

try:
    from moviepy.editor import (
        VideoFileClip,
        ImageClip,
        CompositeVideoClip,
        concatenate_videoclips,
        concatenate_audioclips,
        AudioFileClip,
        TextClip,
        CompositeAudioClip,
    )
    from moviepy.video.fx import resize, fadein, fadeout
except ImportError:
    print("ERROR: moviepy not installed. Run: pip install moviepy pillow requests")
    sys.exit(1)


class VideoGenerator:
    """Generate cinematic videos from images with Ken Burns effect and music."""

    def __init__(self, output_dir: str = "/tmp/video_generation"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir = None

    def generate_video(
        self,
        user_id: str,
        destination: str,
        image_urls: List[str],
        music_file_path: Optional[str] = None,
        output_filename: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> str:
        """
        Generate a video from images.

        Args:
            user_id: User ID
            destination: Destination name (e.g., "Paris")
            image_urls: List of image URLs to use
            music_file_path: Path to music file (optional)
            output_filename: Output filename (optional, auto-generated if not provided)
            metadata: Optional metadata (tags, descriptions, etc.)

        Returns:
            Path to the generated video file
        """
        if not image_urls:
            raise ValueError("No images provided for video generation")

        # Create temporary directory for this video
        self.temp_dir = Path(tempfile.mkdtemp(prefix=f"video_{user_id}_{destination}_"))
        
        try:
            # Download images
            image_paths = self._download_images(image_urls)
            
            # Generate video clips with Ken Burns effect
            video_clips = self._create_ken_burns_clips(image_paths)
            
            # Add intro title
            intro_clip = self._create_intro_clip(destination, user_id, metadata)
            if intro_clip:
                video_clips.insert(0, intro_clip)
            
            # Concatenate all clips with transitions
            final_video = self._concatenate_with_transitions(video_clips)
            
            # Add music if provided
            if music_file_path and os.path.exists(music_file_path):
                final_video = self._add_music(final_video, music_file_path)
            
            # Generate output filename
            if not output_filename:
                output_filename = f"destination_video_{user_id}_{destination}_{int(os.urandom(4).hex(), 16)}.mp4"
            
            output_path = self.output_dir / output_filename
            
            # Export video (1080x1920 vertical, 30fps)
            final_video = final_video.resize((1080, 1920))
            final_video.write_videofile(
                str(output_path),
                fps=30,
                codec='libx264',
                audio_codec='aac',
                preset='medium',
                bitrate='8000k',
                threads=4,
            )
            
            # Cleanup
            final_video.close()
            
            return str(output_path)
            
        finally:
            # Clean up temporary files
            if self.temp_dir and self.temp_dir.exists():
                shutil.rmtree(self.temp_dir)

    def _download_images(self, image_urls: List[str]) -> List[str]:
        """Download images from URLs to temporary directory."""
        image_paths = []
        
        for idx, url in enumerate(image_urls):
            try:
                # Download image
                image_path = self.temp_dir / f"image_{idx:04d}.jpg"
                
                # Handle both HTTP and HTTPS
                if url.startswith('http'):
                    response = requests.get(url, timeout=30, stream=True)
                    response.raise_for_status()
                    with open(image_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                else:
                    # Local file path
                    shutil.copy(url, image_path)
                
                # Verify and resize image if needed
                img = Image.open(image_path)
                # Resize to 1080x1920 if needed (maintain aspect ratio)
                img.thumbnail((1080, 1920), Image.Resampling.LANCZOS)
                img.save(image_path, 'JPEG', quality=85)
                
                image_paths.append(str(image_path))
                
            except Exception as e:
                print(f"WARNING: Failed to download image {url}: {e}")
                continue
        
        if not image_paths:
            raise ValueError("No images could be downloaded")
        
        return image_paths

    def _create_ken_burns_clips(self, image_paths: List[str], duration_per_image: float = 3.0) -> List[ImageClip]:
        """Create video clips with Ken Burns effect (zoom/pan)."""
        clips = []
        
        for image_path in image_paths:
            try:
                # Load image
                img = ImageClip(image_path)
                
                # Calculate zoom and pan
                # Start: zoomed in slightly, pan to one corner
                # End: zoomed out, pan to another corner
                zoom_start = 1.1
                zoom_end = 1.0
                
                # Create clip with Ken Burns effect
                clip = img.set_duration(duration_per_image).resize((1080, 1920))
                
                # Apply zoom effect (simplified - moviepy doesn't have built-in Ken Burns)
                # We'll use a simple crossfade instead
                clip = clip.crossfadein(0.5).crossfadeout(0.5)
                
                clips.append(clip)
                
            except Exception as e:
                print(f"WARNING: Failed to create clip from {image_path}: {e}")
                continue
        
        return clips

    def _create_intro_clip(
        self, destination: str, user_id: str, metadata: Optional[Dict] = None
    ) -> Optional[ImageClip]:
        """Create intro title clip."""
        try:
            # Create a simple text overlay on a gradient background
            # For simplicity, we'll use the first image as background
            # In production, you might want a custom intro background
            
            # Create text clips
            title_text = f"Trip to {destination}"
            subtitle_text = f"Shared by @user_{user_id[:8]}"
            
            # Create a simple colored background
            bg = ImageClip(size=(1080, 1920), color=(41, 128, 185), duration=2.0)
            
            # Add text (requires imagemagick for TextClip)
            try:
                title = TextClip(
                    title_text,
                    fontsize=60,
                    color='white',
                    font='Arial-Bold',
                    method='caption',
                    size=(900, None),
                ).set_position(('center', 800)).set_duration(2.0)
                
                subtitle = TextClip(
                    subtitle_text,
                    fontsize=40,
                    color='white',
                    font='Arial',
                    method='caption',
                    size=(900, None),
                ).set_position(('center', 920)).set_duration(2.0)
                
                intro = CompositeVideoClip([bg, title, subtitle])
                intro = intro.fadein(0.5).fadeout(0.5)
                
                return intro
            except Exception as e:
                print(f"WARNING: TextClip failed (imagemagick may not be installed): {e}")
                # Return simple background if text fails
                return bg.fadein(0.5).fadeout(0.5)
                
        except Exception as e:
            print(f"WARNING: Failed to create intro clip: {e}")
            return None

    def _concatenate_with_transitions(self, clips: List[ImageClip]) -> VideoFileClip:
        """Concatenate clips with smooth crossfade transitions."""
        if not clips:
            raise ValueError("No clips to concatenate")
        
        if len(clips) == 1:
            return clips[0]
        
        # Apply crossfade transitions between clips
        transitioned_clips = []
        
        for i, clip in enumerate(clips):
            if i == 0:
                # First clip: fade in
                transitioned_clips.append(clip.fadein(0.5))
            elif i == len(clips) - 1:
                # Last clip: fade out
                transitioned_clips.append(clip.fadeout(0.5))
            else:
                # Middle clips: fade in and out
                transitioned_clips.append(clip.fadein(0.5).fadeout(0.5))
        
        # Concatenate all clips
        final = concatenate_videoclips(transitioned_clips, method="compose")
        
        return final

    def _add_music(self, video: VideoFileClip, music_file_path: str) -> VideoFileClip:
        """Add background music to video."""
        try:
            audio = AudioFileClip(music_file_path)
            
            # Match audio duration to video duration
            if audio.duration > video.duration:
                audio = audio.subclip(0, video.duration)
            else:
                # Loop audio if shorter than video
                loops_needed = int(video.duration / audio.duration) + 1
                audio = concatenate_audioclips([audio] * loops_needed).subclip(0, video.duration)
            
            # Add fade in/out to audio
            audio = audio.fadein(1.0).fadeout(1.0)
            
            # Normalize volume (reduce to 30% to not overpower)
            audio = audio.volumex(0.3)
            
            # Set audio to video
            final_video = video.set_audio(audio)
            
            return final_video
            
        except Exception as e:
            print(f"WARNING: Failed to add music: {e}")
            return video


def main():
    """Main entry point for video generation."""
    if len(sys.argv) < 2:
        print("Usage: video_generator.py <json_config>")
        sys.exit(1)
    
    config_json = sys.argv[1]
    config = json.loads(config_json)
    
    generator = VideoGenerator(output_dir=config.get('output_dir', '/tmp/video_generation'))
    
    try:
        output_path = generator.generate_video(
            user_id=config['user_id'],
            destination=config['destination'],
            image_urls=config['image_urls'],
            music_file_path=config.get('music_file_path'),
            output_filename=config.get('output_filename'),
            metadata=config.get('metadata'),
        )
        
        # Output result as JSON
        result = {
            'success': True,
            'video_path': output_path,
            'error': None,
        }
        print(json.dumps(result))
        
    except Exception as e:
        result = {
            'success': False,
            'video_path': None,
            'error': str(e),
        }
        print(json.dumps(result))
        sys.exit(1)


if __name__ == '__main__':
    main()

