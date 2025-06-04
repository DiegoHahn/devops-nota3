# Use uma imagem base oficial do Node.js (escolha a versão LTS mais recente compatível com seu Strapi)
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine AS base

# Defina o diretório de trabalho
WORKDIR /opt/app

# Instale o pnpm globalmente
# Você pode especificar uma versão do pnpm se necessário, ex: pnpm@8
RUN npm install -g pnpm

# Copie os arquivos de manifesto do pnpm
COPY package.json pnpm-lock.yaml* ./

# Instale as dependências de produção usando pnpm
# Se você tiver dependências de desenvolvimento necessárias para o build, 
# considere uma stage separada ou ajuste o comando de instalação.
RUN pnpm install --frozen-lockfile --prod

# Copie o restante do código da aplicação
COPY . .

# Construa a aplicação Strapi para produção
# Certifique-se de que as variáveis de ambiente necessárias para o build (se houver) estejam disponíveis
# ou sejam passadas como build args se necessário.
ENV NODE_ENV=production
RUN pnpm build

# Exponha a porta que o Strapi usa (padrão 1337)
EXPOSE 1337

# Comando para iniciar a aplicação Strapi
# As variáveis de ambiente como APP_KEYS, JWT_SECRET, etc., devem ser injetadas no runtime do container.
CMD ["pnpm", "start"] 