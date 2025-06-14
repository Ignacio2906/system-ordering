# Imagen base con NGINX para servir contenido estático
FROM nginx:alpine

# Elimina los archivos por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia el contenido de tu proyecto a la carpeta pública de nginx
COPY . /usr/share/nginx/html

# Expone el puerto 80 para que podamos acceder al sitio
EXPOSE 80
