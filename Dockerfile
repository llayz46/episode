FROM php:8.4-cli

# Dépendances système + Node
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libzip-dev \
    libpq-dev \
    nodejs \
    npm \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

# Laravel
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

# Frontend
# PHP existe maintenant, donc Wayfinder peut exécuter
# "php artisan wayfinder:generate"
RUN npm install -g pnpm@10

RUN pnpm install --frozen-lockfile

RUN pnpm build

# Permissions Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
