/* eslint-disable prettier/prettier */
export const KAFKA_TOPICS = {
  CATEGORIES: {
    CREATE: 'category.create',
    UPDATE: 'category.update',
    DELETE: 'category.delete',
    RESTORE: 'category.restore',
    HARD_DELETE: 'category.hard_delete',
    FIND_ALL: 'category.find_all',
    FIND_ONE: 'category.find_one',
    FIND_BY_SLUG: 'category.find_by_slug',
    FIND_BY_GENDER: 'category.find_by_gender',
    FIND_WITH_SUBCATEGORIES: 'category.find_with_subcategories',
    UPDATE_STATUS: 'category.update_status',
    UPDATE_SORT_ORDER: 'category.update_sort_order',
    BULK_CREATE: 'category.bulk_create',
    GET_STATS: 'category.get_stats',
    VALIDATE: 'category.validate',
    
    // Event topics for notifications
    CREATED: 'category.created',
    UPDATED: 'category.updated',
    DELETED: 'category.deleted',
    RESTORED: 'category.restored',
    STATUS_CHANGED: 'category.status_changed'
  },
  
  SUBCATEGORIES: {
    CREATE: 'subcategory.create',
    UPDATE: 'subcategory.update',
    DELETE: 'subcategory.delete',
    RESTORE: 'subcategory.restore',
    HARD_DELETE: 'subcategory.hard_delete',
    FIND_ALL: 'subcategory.find_all',
    FIND_ONE: 'subcategory.find_one',
    FIND_BY_SLUG: 'subcategory.find_by_slug',
    FIND_BY_CATEGORY: 'subcategory.find_by_category',
    UPDATE_STATUS: 'subcategory.update_status',
    UPDATE_SORT_ORDER: 'subcategory.update_sort_order',
    BULK_CREATE: 'subcategory.bulk_create',
    GET_STATS: 'subcategory.get_stats',
    VALIDATE: 'subcategory.validate',
    
    // Event topics
    CREATED: 'subcategory.created',
    UPDATED: 'subcategory.updated',
    DELETED: 'subcategory.deleted',
    RESTORED: 'subcategory.restored',
    STATUS_CHANGED: 'subcategory.status_changed'
  },
  
  COLLECTIONS: {
    CREATE: 'collection.create',
    UPDATE: 'collection.update',
    DELETE: 'collection.delete',
    RESTORE: 'collection.restore',
    HARD_DELETE: 'collection.hard_delete',
    FIND_ALL: 'collection.find_all',
    FIND_ONE: 'collection.find_one',
    FIND_BY_SLUG: 'collection.find_by_slug',
    FIND_BY_TYPE: 'collection.find_by_type',
    UPDATE_STATUS: 'collection.update_status',
    UPDATE_SORT_ORDER: 'collection.update_sort_order',
    BULK_CREATE: 'collection.bulk_create',
    GET_STATS: 'collection.get_stats',
    VALIDATE: 'collection.validate',
    
    // Event topics
    CREATED: 'collection.created',
    UPDATED: 'collection.updated',
    DELETED: 'collection.deleted',
    RESTORED: 'collection.restored',
    STATUS_CHANGED: 'collection.status_changed'
  },
  
  GENDER: {
    CREATE: 'gender.create',
    UPDATE: 'gender.update',
    DELETE: 'gender.delete',
    RESTORE: 'gender.restore',
    HARD_DELETE: 'gender.hard_delete',
    FIND_ALL: 'gender.find_all',
    FIND_ONE: 'gender.find_one',
    FIND_BY_SLUG: 'gender.find_by_slug',
    UPDATE_STATUS: 'gender.update_status',
    UPDATE_SORT_ORDER: 'gender.update_sort_order',
    BULK_CREATE: 'gender.bulk_create',
    GET_STATS: 'gender.get_stats',
    VALIDATE: 'gender.validate',
    
    // Event topics
    CREATED: 'gender.created',
    UPDATED: 'gender.updated',
    DELETED: 'gender.deleted',
    RESTORED: 'gender.restored',
    STATUS_CHANGED: 'gender.status_changed'
  },
  
  // Cross-service events
  EVENTS: {
    HEALTH_CHECK: 'service.health_check',
    CACHE_INVALIDATE: 'service.cache_invalidate',
    BULK_OPERATION: 'service.bulk_operation'
  }
} as const;

export type KafkaTopicType = typeof KAFKA_TOPICS;