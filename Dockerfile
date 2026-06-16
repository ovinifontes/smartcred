# Smart Cred — site estático servido por nginx
FROM nginx:1.27-alpine

# Configuração do nginx (gzip + cache de assets)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas os arquivos do site (sem references/, Dockerfile, .git etc.)
COPY index.html sobre-nos.html politica-de-privacidade.html termos-e-condicoes.html /usr/share/nginx/html/
COPY assets/  /usr/share/nginx/html/assets/
COPY css/     /usr/share/nginx/html/css/
COPY js/      /usr/share/nginx/html/js/
COPY vendor/  /usr/share/nginx/html/vendor/

EXPOSE 80

# A imagem base já inicia o nginx em foreground.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
