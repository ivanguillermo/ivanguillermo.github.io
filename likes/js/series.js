var series_epi=[
	    [psyp_epi, dn_epi, sel_epi, fri_epi, hb_epi],
	    ['Psycho_Pass','Death_Note','SEL','friends','Helluva_Boss']
	    ];

	    var epi_tit = document.getElementById('epi_ser_name');
		var epi= document.getElementById('episodios');
	  

		function print_epi(x){		

		const player = document.getElementById('player_video_p');
		const fgh = series_epi[1][x].toLowerCase();
				
		player.poster= 'series/'+ fgh + '.png';
		epi.innerHTML='';

	    var k=series_epi[0][x];
	    epi_tit.innerHTML=k[0][0];
	  	for (i = 1; i < k.length; i++) 
	    {epi.innerHTML += 
	              `<tr>                    
	                  <td>
	                    <div class='preview' style="background:url('series/${series_epi[1][x]}/${k[0][1]}${i}.png')">
	                      <source src="${k[i][3]}" type="video/mp4">
	                    </div>
	                    <div>                       
	                        <i data-label="epi_name">${k[i][0]} </i><br/>
	                        <i data-label="epi_a">${k[i][1]} </i><br/>
	                        <i data-label="epi_b">${k[i][2]}</i><br/>
	                    </div>
	                  </td>
	              </tr>`;}
	  };
	  print_epi(1);