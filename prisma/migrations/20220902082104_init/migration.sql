-- CreateEnum
CREATE TYPE "CommonStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'TRANSFERED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('PENDING', 'PUBLISHED', 'PAUSED', 'FAILED');

-- CreateEnum
CREATE TYPE "HistoryTypes" AS ENUM ('MINTED', 'BIDS', 'TRANSFER', 'COMISSION', 'ADMIN_COMISSION');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "image" VARCHAR(500),
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "wallet_address" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255),
    "name" VARCHAR(255),
    "profile_img" VARCHAR(500),
    "banner_img" VARCHAR(500),
    "email" VARCHAR(255),
    "reset_code" VARCHAR(255),
    "is_email_verified" SMALLINT DEFAULT 0,
    "email_verified_at" TIMESTAMP(3),
    "phone" VARCHAR(255),
    "bio" TEXT,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_login_nonces" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nonce" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_login_nonces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "contract_address" VARCHAR(255),
    "description" TEXT,
    "logo" VARCHAR(255) NOT NULL,
    "feature_image" VARCHAR(255),
    "banner_image" VARCHAR(255),
    "category_id" INTEGER NOT NULL,
    "royalties" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payout_address" VARCHAR(255),
    "blockchain_id" INTEGER NOT NULL,
    "display_theme" SMALLINT NOT NULL DEFAULT 0,
    "is_sensitive" SMALLINT NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchains" (
    "id" SERIAL NOT NULL,
    "network_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(255) NOT NULL,
    "rpc_url" VARCHAR(255),
    "public_rpc_url" VARCHAR(255),
    "wss_url" VARCHAR(255),
    "api_key" VARCHAR(255),
    "provider" SMALLINT NOT NULL DEFAULT 1,
    "explorer_url" VARCHAR(255),
    "chain_id" INTEGER,
    "currency_symbol" VARCHAR(255) NOT NULL,
    "nft_contract" VARCHAR(255),
    "exchange_contract" VARCHAR(255),
    "logo" VARCHAR(255),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "blockchains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_tokens" (
    "id" SERIAL NOT NULL,
    "blockchain_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "token_symbol" VARCHAR(255),
    "total_decimal" SMALLINT NOT NULL DEFAULT 18,
    "min_amount_to_execute_auction" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "type" SMALLINT NOT NULL,
    "contract_address" VARCHAR(255),
    "logo" VARCHAR(255),
    "usd_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sync_rate_status" SMALLINT NOT NULL DEFAULT 1,
    "is_default" SMALLINT NOT NULL DEFAULT 0,
    "is_wrapable" SMALLINT NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payment_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_token_mappings" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "payment_token_id" INTEGER NOT NULL,

    CONSTRAINT "payment_token_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" SERIAL NOT NULL,
    "model_id" INTEGER NOT NULL,
    "model_type" SMALLINT NOT NULL,
    "website_link" VARCHAR(255),
    "discord_link" VARCHAR(255),
    "instagram_link" VARCHAR(255),
    "medium_link" VARCHAR(255),
    "telegram_link" VARCHAR(255),
    "facebook_link" VARCHAR(255),
    "whatssapp_link" VARCHAR(255),
    "linkedin_link" VARCHAR(255),

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "external_url" VARCHAR(255),
    "media_path" VARCHAR(255) NOT NULL,
    "thumbnail_path" VARCHAR(255),
    "filetype" VARCHAR(40) NOT NULL DEFAULT E'image',
    "token_uri" VARCHAR(255),
    "token_id" VARCHAR(255),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "payment_token_id" INTEGER,
    "is_unlockable_content" SMALLINT NOT NULL DEFAULT 0,
    "unlockable_content" TEXT,
    "collection_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "is_minted" SMALLINT NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "minted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_activities" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "from_id" INTEGER,
    "to_id" INTEGER,
    "hash" TEXT,
    "amount" TEXT,
    "payment_token_id" INTEGER,
    "event" SMALLINT NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "payment_token_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buy_offers" (
    "id" SERIAL NOT NULL,
    "uid" VARCHAR(64) NOT NULL,
    "signature" VARCHAR(255),
    "nonce" VARCHAR(255) NOT NULL,
    "type" SMALLINT NOT NULL,
    "item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_token_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "seller_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fee_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fee_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "royalty_address" VARCHAR(255),
    "royalty_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "royalty_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buy_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_offers" (
    "id" SERIAL NOT NULL,
    "uid" VARCHAR(64) NOT NULL,
    "signature" VARCHAR(255),
    "nonce" VARCHAR(255) NOT NULL,
    "type" SMALLINT NOT NULL,
    "item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_token_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "seller_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fee_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fee_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "royalty_address" VARCHAR(255),
    "royalty_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "royalty_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" SMALLINT NOT NULL,
    "reserved_address" VARCHAR(255),
    "reserved_price" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sell_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchanges" (
    "id" SERIAL NOT NULL,
    "uid" VARCHAR(64) NOT NULL,
    "item_id" INTEGER NOT NULL,
    "payment_token_id" INTEGER NOT NULL,
    "sell_offer_id" INTEGER,
    "buy_offer_id" INTEGER,
    "seller_id" INTEGER,
    "buyer_id" INTEGER,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "transaction_hash" VARCHAR(255),
    "status" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" SERIAL NOT NULL,
    "uid" VARCHAR(64) NOT NULL,
    "item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "to_address" TEXT NOT NULL,
    "to_user_id" INTEGER,
    "transaction_hash" VARCHAR(255),
    "status" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_watch_lists" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_watch_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staffs" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255),
    "description" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "emailVerifiedAt" TIMESTAMP(3),
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetCode" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER,
    "status" SMALLINT DEFAULT 1,

    CONSTRAINT "staffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "permissions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "option_group" VARCHAR(255),
    "option_key" VARCHAR(255) NOT NULL,
    "option_value" TEXT,
    "value_type" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_earnings" (
    "id" SERIAL NOT NULL,
    "exchange_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "payment_token_id" INTEGER NOT NULL,
    "royalty_address" VARCHAR(255),
    "royalty_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "royalty_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_favourite_lists" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_favourite_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_view_lists" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_view_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "events" TEXT,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tx_nonces" (
    "id" SMALLSERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "wallet_address" VARCHAR(255) NOT NULL,
    "nonce" VARCHAR(255) NOT NULL DEFAULT E'0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tx_nonces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_letter_subscriptions" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_letter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rankings" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "blockchain_id" INTEGER NOT NULL,
    "native_token_id" INTEGER NOT NULL,
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "total_volume_in_native" DECIMAL(65,30),
    "total_volume_in_usd" DECIMAL(65,30),
    "one_day_volume_in_native" DECIMAL(65,30),
    "one_day_volume_in_usd" DECIMAL(65,30),
    "one_day_volume_percent" DOUBLE PRECISION,
    "seven_days_volume_in_native" DECIMAL(65,30),
    "seven_days_volume_in_usd" DECIMAL(65,30),
    "seven_days_volume_percent" DOUBLE PRECISION,
    "thirty_days_volume_in_native" DECIMAL(65,30),
    "thirty_days_volume_in_usd" DECIMAL(65,30),
    "thirty_days_volume_percent" DOUBLE PRECISION,
    "floor_price_in_native" DECIMAL(65,30),
    "floor_price_in_usd" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rankings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_title_key" ON "categories"("title");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "collections_name_key" ON "collections"("name");

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blockchains_network_name_key" ON "blockchains"("network_name");

-- CreateIndex
CREATE UNIQUE INDEX "blockchains_slug_key" ON "blockchains"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "payment_tokens_blockchain_id_contract_address_key" ON "payment_tokens"("blockchain_id", "contract_address");

-- CreateIndex
CREATE UNIQUE INDEX "items_name_key" ON "items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "items_slug_key" ON "items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "buy_offers_uid_key" ON "buy_offers"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "sell_offers_uid_key" ON "sell_offers"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "exchanges_uid_key" ON "exchanges"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_uid_key" ON "transfers"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_username_key" ON "staffs"("username");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_email_key" ON "staffs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_phone_key" ON "staffs"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "settings_option_key_key" ON "settings"("option_key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_user_id_key" ON "notification_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_letter_subscriptions_email_key" ON "news_letter_subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rankings_collection_id_key" ON "rankings"("collection_id");

-- AddForeignKey
ALTER TABLE "wallet_login_nonces" ADD CONSTRAINT "wallet_login_nonces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_blockchain_id_fkey" FOREIGN KEY ("blockchain_id") REFERENCES "blockchains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_tokens" ADD CONSTRAINT "payment_tokens_blockchain_id_fkey" FOREIGN KEY ("blockchain_id") REFERENCES "blockchains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_token_mappings" ADD CONSTRAINT "payment_token_mappings_payment_token_id_fkey" FOREIGN KEY ("payment_token_id") REFERENCES "payment_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_token_mappings" ADD CONSTRAINT "payment_token_mappings_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_payment_token_id_fkey" FOREIGN KEY ("payment_token_id") REFERENCES "payment_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_activities" ADD CONSTRAINT "item_activities_payment_token_id_fkey" FOREIGN KEY ("payment_token_id") REFERENCES "payment_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_activities" ADD CONSTRAINT "item_activities_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_activities" ADD CONSTRAINT "item_activities_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_activities" ADD CONSTRAINT "item_activities_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_payment_token_id_fkey" FOREIGN KEY ("payment_token_id") REFERENCES "payment_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buy_offers" ADD CONSTRAINT "buy_offers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buy_offers" ADD CONSTRAINT "buy_offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buy_offers" ADD CONSTRAINT "buy_offers_payment_token_id_fkey" FOREIGN KEY ("payment_token_id") REFERENCES "payment_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_offers" ADD CONSTRAINT "sell_offers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_offers" ADD CONSTRAINT "sell_offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_offers" ADD CONSTRAINT "sell_offers_payment_token_id_fkey" FOREIGN KEY ("payment_token_id") REFERENCES "payment_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_sell_offer_id_fkey" FOREIGN KEY ("sell_offer_id") REFERENCES "sell_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_buy_offer_id_fkey" FOREIGN KEY ("buy_offer_id") REFERENCES "buy_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_payment_token_id_fkey" FOREIGN KEY ("payment_token_id") REFERENCES "payment_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_watch_lists" ADD CONSTRAINT "collection_watch_lists_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_watch_lists" ADD CONSTRAINT "collection_watch_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_exchange_id_fkey" FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_payment_token_id_fkey" FOREIGN KEY ("payment_token_id") REFERENCES "payment_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_favourite_lists" ADD CONSTRAINT "item_favourite_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_favourite_lists" ADD CONSTRAINT "item_favourite_lists_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_native_token_id_fkey" FOREIGN KEY ("native_token_id") REFERENCES "payment_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
