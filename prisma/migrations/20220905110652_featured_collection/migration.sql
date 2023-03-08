-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "is_featured" SMALLINT NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "BidStatus";

-- DropEnum
DROP TYPE "CollectionStatus";

-- DropEnum
DROP TYPE "CommonStatus";

-- DropEnum
DROP TYPE "HistoryTypes";

-- CreateTable
CREATE TABLE "featured_collections" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "featured_collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "featured_collections_collection_id_key" ON "featured_collections"("collection_id");

-- AddForeignKey
ALTER TABLE "featured_collections" ADD CONSTRAINT "featured_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
