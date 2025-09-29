var reproductor = document.getElementById('reproductor');
				var audiotime= reproductor.currentTime;
				const progress_audio = document.getElementById('progress_audio')
				reproductor.volume = 0.95;

				const current = document.querySelector('.audio_current');
				const duration = document.querySelector('.audio_duration');

				const play_centros = document.querySelectorAll('.playmusic');

				var play_bot = document.getElementById('rep_play-btn');

				const songOn =document.querySelector('song_on');
			    const songOnBand =document.querySelector('song_on_band');	
				
				var p_s= 1;

				function play_stop()
				{
					p_s++;
					if ((p_s%2)==0)
						{reproductor.play();play_bot.style.color='var(--netflix)';
						play_bot.innerHTML='||'};
					if ((p_s%2)>0)
						{reproductor.pause();play_bot.style.color='white';
					play_bot.innerHTML='<i class="fa fa-play-circle"></i>'};	
					console.log(p_s)				
				}

				function play_music(){        			      
			      const audiosrc = this.querySelector('audio');		      		      

			      play_centros.forEach(play_centro => play_centro.style.backgroundColor='var(--spotify)');
			      reproductor.src = audiosrc.src;			      
			      reproductor.currentTime = 0;
			      reproductor.play();
			      song_on.innerHTML = noline(audiosrc.dataset.name);
			      song_on_band.innerHTML = noline(audiosrc.dataset.band);
			      this.style.backgroundColor='red';
			      console.log(eproductor.src);
			      ;
			    }		

			    function handleaudioProgress(){
			    	progress_audio.value = (reproductor.currentTime/reproductor.duration)*100;
			    	current.innerHTML = Math.floor(reproductor.currentTime / 60) +":"+Math.floor(reproductor.currentTime % 60);
					duration.innerHTML = Math.floor(reproductor.duration / 60) +":"+Math.floor(reproductor.duration % 60);
			    }	  


			    play_centros.forEach(play_centro => play_centro.addEventListener('click', play_music));

			    play_bot.addEventListener('click', play_stop);

			    reproductor.addEventListener('timeupdate', handleaudioProgress);