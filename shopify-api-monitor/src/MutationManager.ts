/**
 * MutationManager.ts
 * Handles optimistic updates and error recovery for mutations
 */

import { v4 as uuidv4 } from 'uuid';
import { StateManager } from './StateManager';
import { NotificationSystem, NotificationType, NotificationTopic } from './NotificationSystem';
import { MutationOperation, OptimisticUpdateFunction } from './types/ShopifyResourceTypes';

/**
 * Manages mutations with optimistic updates and error recovery
 */
export class MutationManager {
  /** Map of pending mutations by ID */
  private pendingMutations: Map<string, MutationOperation> = new Map();
  
  /**
   * Creates a new MutationManager
   * 
   * @param stateManager - StateManager instance for cache operations
   * @param notificationSystem - NotificationSystem for user notifications
   */
  constructor(
    private stateManager: StateManager,
    private notificationSystem: NotificationSystem
  ) {}
  
  /**
   * Registers a mutation with optional optimistic update
   * 
   * @param operation - Mutation operation details
   * @param optimisticUpdate - Optional function to apply optimistic update
   * @returns Operation ID
   */
  registerMutation(
    operation: Omit<MutationOperation, 'id' | 'timestamp'>,
    optimisticUpdate?: OptimisticUpdateFunction
  ): string {
    // Generate unique ID for the operation
    const id = uuidv4();
    
    // Create complete operation object
    const completeOperation: MutationOperation = {
      ...operation,
      id,
      timestamp: Date.now()
    };
    
    // Store in pending mutations
    this.pendingMutations.set(id, completeOperation);
    
    // Apply optimistic update if provided
    if (optimisticUpdate) {
      try {
        optimisticUpdate(this.stateManager);
      } catch (error) {
        console.error('Error applying optimistic update:', error);
        // Don't fail the whole operation if optimistic update fails
      }
    }
    
    return id;
  }
  
  /**
   * Marks a mutation as completed successfully
   * 
   * @param id - Operation ID
   * @param result - Operation result
   */
  completeMutation(id: string, result: any): void {
    // Remove from pending mutations
    this.pendingMutations.delete(id);
  }
  
  /**
   * Handles a failed mutation by applying rollback if available
   * 
   * @param id - Operation ID
   * @param error - Error that occurred
   */
  failMutation(id: string, error: Error): void {
    const operation = this.pendingMutations.get(id);
    
    if (!operation) {
      console.warn(`Attempted to fail unknown mutation: ${id}`);
      return;
    }
    
    // Apply rollback function if available
    if (operation.rollback) {
      try {
        operation.rollback(this.stateManager);
      } catch (rollbackError) {
        console.error('Error rolling back failed mutation:', rollbackError);
        // Notify about rollback failure
        this.notificationSystem.notify(
          `Failed to roll back changes: ${(rollbackError as Error).message}`,
          NotificationType.ERROR,
          NotificationTopic.SYSTEM
        );
      }
    }
    
    // Remove from pending mutations
    this.pendingMutations.delete(id);
    
    // Notify user about the failure
    this.notificationSystem.notify(
      `Operation failed: ${error.message}`,
      NotificationType.ERROR,
      NotificationTopic.SYSTEM
    );
  }
  
  /**
   * Gets all pending mutations
   * 
   * @returns Array of pending mutation operations
   */
  getPendingMutations(): MutationOperation[] {
    return Array.from(this.pendingMutations.values());
  }
  
  /**
   * Gets a specific pending mutation by ID
   * 
   * @param id - Operation ID
   * @returns Mutation operation or undefined if not found
   */
  getPendingMutation(id: string): MutationOperation | undefined {
    return this.pendingMutations.get(id);
  }
  
  /**
   * Checks if there are any pending mutations
   * 
   * @returns True if there are pending mutations
   */
  hasPendingMutations(): boolean {
    return this.pendingMutations.size > 0;
  }
  
  /**
   * Clears all pending mutations (use with caution)
   */
  clearPendingMutations(): void {
    this.pendingMutations.clear();
  }
}