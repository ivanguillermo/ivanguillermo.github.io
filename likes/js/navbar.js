const navs = document.querySelector('#navflix');  
		  	const topOfNav = navs.offsetTop;
		  	var alpha = 0.3;

			const myLikes = document.querySelector('#myLikes'); 
			const bandas = document.querySelector('#bandas'); 			
			const sports  = document.querySelector('#deportes');  

			const topOfLikes = myLikes.offsetTop  ;	
			const topOfBandas = bandas.offsetTop  ;	

			const topOfSports = sports.offsetTop  ;	

			
			function activeNav(){
					navs.style.backgroundColor=`rgba(30,30,30,${alpha})`;				
					if(window.scrollY > topOfLikes)  
						{alpha = window.scrollY/topOfBandas;} 
					else if(window.scrollY > topOfBandas)  
						{alpha = 1;} 
					else  {alpha = 0.3;}   					    			    
						  } 
			window.addEventListener('scroll', activeNav);