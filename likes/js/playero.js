const player= document.querySelector('.playero');
				const video = player.querySelector('.viewer');
				const progress = player.querySelector('.progress');
				const progressBar = player.querySelector('.progress_filled');
				const toggle = player.querySelector('.toggle');
				//const skipButtons = player.querySelectorAll('[data-skip]');
				const speedBtn = document.getElementById('speed');
				const ranges = player.querySelectorAll('.player_slider');
				let currentTime = video.currentTime;


				video.volume = 0.5;
				progressBar.style.flexBasis = `0%`;

				function togglePlay(){
					const method = video.paused ? 'play' : 'pause';
					video[method]();
				}

				function skip(t){
					video.currentTime += t;					
				}

				function handleRangeUpdate(){
					video[this.name] = this.value;				
				}

				function scrub(e){
					const scrubTime= (e.offsetX / progress.offsetWidth) * video.duration;
					video.currentTime = scrubTime;
				}
				function resetSpeed(){
					video.playbackRate = 1;
					speedBtn.value = 1;
				}

				function updateButton(){
					const icon = this.paused ? '►' : '||';
					toggle.textContent = icon;
				}

				function handleProgress(){
					const percent = (video.currentTime / video.duration) * 100;
					progressBar.style.flexBasis = `${percent}%`;
					progressBar.style.width = `${percent}%`;
					progressBar.style.backgroundColor = 'var(--netflix)';
				}

				function fullScreening() {
					video.mozRequestFullScreen();
					video.requestFullscreen();
				}

				video.addEventListener('click', togglePlay);
				video.addEventListener('play', updateButton);
				video.addEventListener('pause', updateButton);
				video.addEventListener('timeupdate', handleProgress);
				toggle.addEventListener('click', togglePlay);
				ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));

				let mousedown = false;
				progress.addEventListener('click', scrub);
				progress.addEventListener('mousemove', (e) => mousedown && scrub(e));
				progress.addEventListener('mousedown', () => mousedown = true);
				progress.addEventListener('mouseup', () => mousedown = false);

$("#modo_cine").click(function () {
		  		  $('.playero, #player, #player_video_p, .player_controls ').animate({width:'100vw'},660);		  		  
		          $('#sidevideoplayer, #youtable, #episodios').animate({width:'0px'},660);;
		    });
		    $("#modo_cine2").click(function () {
		  		  $('.playero, #player, #player_video_p, .player_controls ').animate({width:'75vw'},660);		  		  
		          $('#sidevideoplayer, table, #episodios').animate({width:'25vw'}, 660);;		          
		    });

const vplayer = document.getElementById('player_video_p');

			    const albumv = document.querySelectorAll('.album');				
				function playalbum(){
				  const albumsrc = this.dataset.src;		      
			      vplayer.src = albumsrc;			      
			      vplayer.play();		      	      			      
			      albumv.forEach(a => a.style.border='2.75px solid white');
			      this.style.border='4.75px solid var(--spotify)';
			    }			    
			    albumv.forEach(a => a.addEventListener('click', playalbum));

			    const filmv= document.querySelectorAll('.moviesv');
			    function playpelicula(){
				  const filmsrc = this.dataset.src;		      
			      vplayer.src = filmsrc;			      
			      vplayer.play();		      	      			      
			      filmv.forEach(a => a.style.border='2.75px solid white');
			      seriesv.forEach(a => a.style.border='2.75px solid white');
			      this.style.border='4.75px solid var(--spotify)';
			      epi.innerHTML = "";
			      
			    }
			    filmv.forEach(a => a.addEventListener('click', playpelicula));

			    const seriesv= document.querySelectorAll('.seriesv');
			    function cargar_episodios(x){
			    	x=this.id.substr(-1);
			    	console.log(this.id.substr(-1));
			    	
			    	epi.innerHTML = "";
			    	print_epi(x);
			    	vplayer.pause();
			    			    				    
			    	vplayer.poster = this.style.backgroundImage.substr(5,).replace('")'," ");
			    	filmv.forEach(a => a.style.border='2.75px solid white');
			    	seriesv.forEach(a => a.style.border='2.75px solid white');
			        this.style.border='4.75px solid var(--spotify)';

			        const videov = document.querySelectorAll('.preview');
			        videov.forEach(v => v.style.border='3px solid var(--spotify)');
			      	this.style.borderColor='blue';
			    	videov.forEach(v => v.addEventListener('click', playvideos));
			    }
			    seriesv.forEach(a => a.addEventListener('click', cargar_episodios));

			    const videov = document.querySelectorAll('.preview');				
				function playvideos(){
				  const videosrc = this.querySelector('source');        			      	      			      
			      vplayer.src = videosrc.src;			      
			      vplayer.play();		      	      	      
			      videov.forEach(v => v.style.border='3px solid var(--spotify)');
			      this.style.borderColor='blue';
			    }			    
			    videov.forEach(v => v.addEventListener('click', playvideos));