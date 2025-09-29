const paneletes = document.querySelectorAll('.panel');
	  	
	  	function abrirpanel(){
	  		this.classList.toggle('open');
	  	}	    
	    paneletes.forEach(panele => panele.addEventListener('click', abrirpanel));


	  	function toggleActive(e){
	  		
	  		if (e.propertyName.includes('flex')){
	  			this.classList.toggle('open-active');
	        
	  		}
	  	}
	  	paneletes.forEach(panel => panel.addEventListener('transitionend', toggleActive));


	    caja_colores = ['#ef1df3','#5ae6e6','#0c2121','#f6f9e7','#f99a0d','#f9186b', '#42e25d'];	

	    const centros = document.querySelectorAll('.centro');
	    function mine(){
     
      		const colores = caja_colores[Math.floor(Math.random() * 6)];
      		document.documentElement.style.setProperty(`--color`,colores);
      
      		const audiosrc = this.querySelector('audio');
      
		      if (this.style.color !== '#3439dc'){
		      player.src = audiosrc.src;
		      player.currentTime = 0;}
		      player.play();      
   		 }
    
   		 centros.forEach(centro => centro.addEventListener('click', mine));  	