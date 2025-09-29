var slide1= document.getElementById('filmes');
						var slide2= document.getElementById('seriess');
						var slide3= document.getElementById('animess');

						function first2last(x,y,z){
							a = x.shift();	
							x.splice(x.length,0,a);
							y.innerHTML='';
							print_slide(y, x, z);
						}
						function last2first(x,y,z){
							a = x.pop();	
							x.splice(0,0,a);
							y.innerHTML='';
							print_slide(y, x, z);
						}

						function film(name, seg, year, src, vsrc) {
							  this.name  = name; 
							  this.seg = seg; 
							  this.year = year;
							  this.src = src;
							  this.vsrc = vsrc;}

							var padrino = new film("El Padrino","F.F. Coppola", "1957", 'el_padrino.png','');
							var matrix = new film("Matrix","The Wachowski", "1998", 'matrix.png','videos/the_matrix.mp4');
							var psycho = new film("Psycho","Hitchcock", "1950", 'psycho.png','videos/psicosis.mp4');
							var antik = new film("antikorper","Christian Alvart", "2005", 'antikorper.png','');
							var samurai = new film("Le Samurai",'Jean Pierre Meville', '1967', 'le_samurai.png','');
							var seven_s = new film("Seven Samurais","A Kurosawa", "1954", 'seven_samurais.png','videos/seven_samurais.mp4');
							var sept = new film("Septimo Sello","Ingmar Bergman", "1957", 'septimo_sello.png','videos/septimo_sello.mp4');

							var peliculas = [samurai, matrix, sept, antik, psycho, seven_s, padrino]

						function serie(name, seg, src, vsrc) {
							  this.name  = name;
							  this.seg  = seg; 							   
							  this.src = src;
							  this.vsrc = vsrc;
							};

							var DN = new serie("Death Note","1", "death_note.png",'');
							var breakB= new serie("Breacking Bad", " ", "breaking_bad.png",'');
							var bojack= new serie("Bojack Horseman", " ", "bojack.png",'');
							var peep_show= new serie("The Peep Show", " ", "peep_show.png",'');
							var house= new serie("House MD", " ", "house.png",'');
							var got= new serie("Game of Thrones", "7", "got.png",'');
							var friends= new serie("Friends", "", "friends.png",'');							


							var series = [DN, breakB, house, friends, bojack, peep_show,  got];

							var deno = new serie("Death Note","1", "death_note.png",'');
							var sel= new serie("Serial Experiment Lain", " ", "sel.png",'');
							var codeg= new serie("Code Geass", " ", "code_geass.png",'');
							var naruto= new serie("Naruto", " ", "naruto.png",'');
							var psypass= new serie("Psycho Pass", " ", "psycho_pass.png",'');
							var ergo= new serie("Ergo Proxy", "7", "ergo_proxy.png",'');
							var hellb= new serie("Helluva Boss", "6", "helluva_boss.png",'');
							

							var animes = [deno, sel, ergo, hellb, codeg, psypass, naruto];


							 function print_slide(x, a, b){
							  for (i = 0; i <6; i++) 
							    {x.innerHTML += 
							    `<div class='item ${b}v' id='film0${i+1}' style='background-image: url(${b}/${a[i].src})' data-src=${a[i].vsrc}>
	                                
							        <h4 class='${b}_name'>${a[i].name}</h4>
							        <h4 class='${b}_2'>${a[i].seg}</h4>
							        <div class='actions'>
							        	<div class='btn-play-movie'><i class="fa fa-play-circle"></i></div>
							            <div class='btn-sound'><i class="fa fa-volume-up"></i></div>
							            <div class='btn-like'><i class="fa fa-thumbs-up"></i></div>
							            <div class='btn-dislike'><i class="fa fa-thumbs-down"></i></div>
							        </div>							        						          
							     </div>`;}
							  };
							  print_slide(slide1, peliculas, 'movies');
							  print_slide(slide2, series, 'series');
							  print_slide(slide3, animes, 'series');

//songs//
var song_list= document.getElementById('mis_canciones');

						function song(name, grupo, album) {
							  this.name  = name; 
							  this.grupo = grupo; 
							  this.album = album;
							  }

							var riesgo = new song("riesgo","los_mesoneros", "caiga_la_noche");
							var cln = new song("caiga_la_noche","los_mesoneros", "caiga_la_noche");							
							var flor_de_fuego= new song("flor_de_fuego ","caramelos_de_cianuro", "flor_de_fuego");
							var slts= new song("smells_like_teen_spirit","nirvana", "in utero");
							var a_guerra_lenta= new song("a_guerra_lenta","caramelos_de_cianuro", "flor_de_fuego ");
							var my_hero= new song("my_hero","foo_fighters", "The Colour and the Shape");
							var metalingus = new song('metalingus', 'alter_bridge', 'One Day Remain');
							var sown = new song ('somewhere_only_we_know', 'keane', 'Hopes and Fears');
							var ebic = new song ('everybodys_changing','keane', 'Hopes and Fears');
							var terraza = new song ('la_terraza', 'caramelos_de_cianuro', 'Frisbee');
							var otherside = new song ('otherside', 'red_hot_chili_peppers', 'Californication');
							var nopa = new song ('number_1_party_anthem', 'arctic_monkeys', 'AM');
							var awin2b = new song ('always_where_I_need_to_be', 'the_kooks', 'Konk');
							var likeastone = new song ('like_a_stone', 'audioslave', 'Audioslave');
							var ruby = new song ('ruby', 'kaiser_chiefs', 'Yours Truly, Angry Mob');
							var bliss = new song ('bliss', 'muse', 'Origin of Symmetry');




							var songs = [cln, otherside, terraza, riesgo, flor_de_fuego, slts, a_guerra_lenta, my_hero, metalingus, sown, ebic, nopa, awin2b, likeastone, ruby, bliss ]	;

						function noline(x){
							for (var i = 0; i < x.length; i++) {
								x = x.replace("_"," ");
							}						
							return x;}
							

						function print_songs(){
						 
						  for (i = 0; i < songs.length; i++) 
						   {
						   	var s_name = noline(songs[i].name);					   							   					  
						   	var s_band  =  noline(songs[i].grupo);
						   	var s_album  =  noline(songs[i].album);					   	

						   	song_list.innerHTML += 
						    `<tr class=''>
					           	<td style='width:2vw' data-label="More" class='more_music'>+</td>
					            <td style='width:4vw' data-label="playmusic_bot" class='play_music_but'>
					               	<p class="playmusic fa fa-play-circle">
					               	  <audio 
					               		src="sounds/${songs[i].grupo}-${songs[i].name}.mp3"
										data-name='${songs[i].name}'
										data-band='${songs[i].grupo}'
									  >
					               	  </audio>
					               	  <td data-label="Nombre"><a>${s_name} </a></td>
							          <td data-label="Artista">${s_band}</td>
							          <td data-label="Album">${s_album}</td>
					               	</p>
					            </td>
					                				                
					        </tr>`}
							};
						print_songs();
//
