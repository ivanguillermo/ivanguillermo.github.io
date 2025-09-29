var books_list= document.getElementById('mis_libros');

						function book(name, autor, href, src) {
							  this.name  = name; 
							  this.autor = autor; 
							  this.href = href;
							  this.src = src;							  
							  }

							var ahz = new book("Asi Hablo Zaratustra","F. Nietzsche", "http://www.enxarxa.com/biblioteca/NIETZSCHE%20Asi%20hablo%20Zaratustra.pdf","ahz");
							var ficciones= new book("Ficciones","JL Borges", "https://docs.google.com/viewer?a=v&pid=sites&srcid=ZGVmYXVsdGRvbWFpbnxiaWJsaWJyb3NwZGZ8Z3g6MWU1OWFiN2EwYWMwNjRiNA", 'ficciones');
							var demian= new book("Demian","H. Hesse", "http://biblio3.url.edu.gt/Libros/2011/Demian.pdf","demian");
							var iliada= new book("La Iliada","Homero", " https://www.biblioteca.org.ar/libros/130860.pdf","iliada");
							var nausea= new book("La Nausea","JP Sartre", "http://imago.yolasite.com/resources/Sartre,%20Jean%20Paul%20-%20La%20nausea.pdf","nausea");
							var existencialismo= new book("Existencialismo es un Humanismo","JP Sartre", "https://www.ucm.es/data/cont/docs/241-2015-06-16-Sartre%20%20El_existencialismo_es_un_humanismo.pdf ","existencialismo");

							var orestiada= new book("Orestiadaa","", "https://rossami.files.wordpress.com/2009/03/la-orestiada1.pdf","orestiada");
							var etranger = new book('El Extranjero', 'A. Camus', 'http://www.libroteca.net/_Mas-descargados/Camus,%20Albert%20-%20El%20Extranjero.pdf', 'extranjero');
							var hamlet= new book('Hamlet', 'W. Shakespeare', 'https://www.suneo.mx/literatura/subidas/William%20Shakespeare%20Hamlet.pdf', 'ehamlet');	
							var rojo_negro = new book('Rojo y Negro', 'Stendhal', 'https://web.seducoahuila.gob.mx/biblioweb/upload/Stendhal%20-%20Rojo%20y%20Negro.pdf', 'rojo_negro');
							var rey_lear= new book('Rey Lear', 'W. Shakespeare', 'https://ddooss.org/libros/rey_lear.pdf', 'Rey Lear');

							var diario_seductor = new book('Diario de un seductor', 'S. Kierkegaard', 'https://www.anamib.com/wp-content/uploads/2019/11/Kierkegard-Soren-Diario-de-un-seductor.pdf', 'diario_seductor');

							

							var books = [ahz, iliada, demian, nausea, ficciones, existencialismo, orestiada, etranger]					


							 function print_books(){
							 
							  for (i = 0; i < books.length; i++) 
							    {books_list.innerHTML += 							    

					        `<div class='item2 item0${i}' id='book0${i}' style='background-image:url("books/${books[i].src}.png")'>
								<div class='btn-play-book'></div>
								<h4 class='book_name'><center>${books[i].name}</center></h4>
								<h4 class='book_autor'>${books[i].autor}</h4>								
								<button class='read'>
									<a target='_blank' href='${books[i].href}'>Leer</a>
								</button>
								<div class='see_more'> + </div>
							</div>`}
							  };
							  print_books();
