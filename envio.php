<?php
// A continuación se capturan los datos especificados del formulario
$name=$_POST['Name'];
$telefono=$_POST['Telefono'];
$email=$_POST['Email'];
$mensaje=$_POST['Menssage'];

// Debes indicar tu correo electrónico, eliminando el ejemplo
$to = "ivanglopezp@gmail.com";

// Puedes cambiar el asunto por defecto y que datos apareceran en el email que te llegue
$subject = "Entrada del Formulario de Contacto";
$message = " Name: " . $name . "\r\n Teléfono: " . $telefono . "\r\n Email: " . $email . "\r\n Mensaje: " . $mensaje;

// Puedes cambiar el nombre del remitente que aparecerá en tu bandeja de entrada, la página de sucesión y el mensaje que ve el usuario al final.
$from = "usuario";
$headers = "From:" . $from . "\r\n";
$headers .= "Content-type: text/plain; charset=UTF-8" . "\r\n"; 
if(@mail($to,$subject,$message,$headers))
{
 print "<script>document.location.href='recibido.html';</script>";
 
// Created by Future Tutorials
}else{
 echo "Error! Please try again.";
}
?>