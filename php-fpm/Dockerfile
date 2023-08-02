FROM php:7.4.33-fpm

MAINTAINER Alex Franks <alex-envoy@users.noreply.github.com>


# Software Installation
#
# Installing dependencies and tools

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        libicu-dev \
        libmemcached-dev \
        libz-dev \
        libpq-dev \
        libjpeg-dev \
        libpng-dev \
        libfreetype6-dev \
        libssl-dev \
        libgmp-dev \
        libzip-dev \
        imagemagick \
        libmagickwand-dev --no-install-recommends
RUN apt-get clean && apt-get autoclean && apt-get --purge -y autoremove && \
    rm -rf /var/lib/apt/lists/*

RUN php -m

# Install basic extensions
RUN docker-php-ext-install pdo_mysql && \
    docker-php-ext-install mysqli && \
    docker-php-ext-install pdo_pgsql && \
    docker-php-ext-install opcache && \
    docker-php-ext-install bcmath && \
    docker-php-ext-install gmp && \
    docker-php-ext-install xml && \
    docker-php-ext-install zip && \
    docker-php-ext-install intl

# Install gd extension
RUN docker-php-ext-configure gd \
        --with-freetype && \
    docker-php-ext-install gd

# Install imagick extension
RUN printf "\n" | pecl install imagick
RUN docker-php-ext-enable imagick

# Install cachetool
RUN curl -so /usr/local/bin/cachetool http://gordalina.github.io/cachetool/downloads/cachetool.phar && chmod +x /usr/local/bin/cachetool

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

