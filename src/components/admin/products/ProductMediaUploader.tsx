import React, { useState, useEffect, useRef } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface ProductMedia {
  id?: string;
  mediaContentType: 'IMAGE' | 'VIDEO' | 'EXTERNAL_VIDEO' | 'MODEL_3D';
  alt?: string;
  src?: string;
  previewImage?: string;
  status?: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
}

export interface ProductMediaUploaderProps {
  productId: string;
  onSave?: (media: ProductMedia[]) => void;
  onCancel?: () => void;
}

const ProductMediaUploader: React.FC<ProductMediaUploaderProps> = ({
  productId,
  onSave,
  onCancel,
}) => {
  const { products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch product data to get current media
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setError(null);

      products.getProduct(productId)
        .then((data) => {
          setProduct(data);
          
          // Extract media
          if (data.media && data.media.edges) {
            const extractedMedia = data.media.edges.map((edge: any) => {
              const node = edge.node;
              let mediaItem: ProductMedia = {
                id: node.id,
                mediaContentType: node.mediaContentType,
                alt: node.alt || '',
                status: 'READY',
              };
              
              // Handle different media types
              if (node.mediaContentType === 'IMAGE' && node.image) {
                mediaItem.src = node.image.url;
                mediaItem.previewImage = node.image.url;
              } else if (node.mediaContentType === 'VIDEO' && node.sources && node.sources.length > 0) {
                mediaItem.src = node.sources[0].url;
                mediaItem.previewImage = node.previewImage?.url;
              } else if (node.mediaContentType === 'EXTERNAL_VIDEO') {
                mediaItem.src = node.embeddedUrl;
                mediaItem.previewImage = node.previewImage?.url;
              } else if (node.mediaContentType === 'MODEL_3D' && node.sources && node.sources.length > 0) {
                mediaItem.src = node.sources[0].url;
                mediaItem.previewImage = node.previewImage?.url;
              }
              
              return mediaItem;
            });
            setMedia(extractedMedia);
          }
        })
        .catch((err) => {
          setError(`Failed to load product media: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [productId, products]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => {
      // Filter for supported file types
      const type = file.type.toLowerCase();
      return (
        type.startsWith('image/') || 
        type.startsWith('video/') || 
        type.endsWith('gltf') || 
        type.endsWith('glb')
      );
    });
    
    if (newFiles.length === 0) {
      setError('No supported files selected. Supported formats: images, videos, and 3D models (glTF/GLB).');
      return;
    }
    
    // Add files to upload queue
    setUploadQueue(prev => [...prev, ...newFiles]);
    
    // Add placeholder media items
    const newMedia = newFiles.map(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const is3DModel = file.type.endsWith('gltf') || file.type.endsWith('glb');
      
      let mediaContentType: 'IMAGE' | 'VIDEO' | 'MODEL_3D';
      if (isImage) {
        mediaContentType = 'IMAGE';
      } else if (isVideo) {
        mediaContentType = 'VIDEO';
      } else if (is3DModel) {
        mediaContentType = 'MODEL_3D';
      } else {
        mediaContentType = 'IMAGE'; // Default
      }
      
      return {
        mediaContentType,
        alt: file.name,
        previewImage: isImage ? URL.createObjectURL(file) : undefined,
        status: 'PROCESSING',
      };
    });
    
    setMedia(prev => [...prev, ...newMedia]);
  };

  const handleRemoveMedia = (index: number) => {
    const mediaItem = media[index];
    
    // If it's a local file that hasn't been uploaded yet
    if (mediaItem.status === 'PROCESSING' && !mediaItem.id) {
      // Remove from upload queue if it's there
      const newUploadQueue = [...uploadQueue];
      if (index - (media.length - uploadQueue.length) >= 0) {
        newUploadQueue.splice(index - (media.length - uploadQueue.length), 1);
        setUploadQueue(newUploadQueue);
      }
      
      // Remove from media list
      const newMedia = [...media];
      newMedia.splice(index, 1);
      setMedia(newMedia);
      return;
    }
    
    // If it's an existing media item, mark it for deletion
    if (mediaItem.id) {
      const newMedia = [...media];
      newMedia[index] = {
        ...newMedia[index],
        status: 'PROCESSING', // Mark as processing for UI feedback
      };
      setMedia(newMedia);
      
      // Delete the media item
      products.deleteProductMedia(productId, [mediaItem.id])
        .then(() => {
          // Remove from media list
          const updatedMedia = media.filter((_, i) => i !== index);
          setMedia(updatedMedia);
        })
        .catch((err) => {
          setError(`Failed to delete media: ${err.message}`);
          // Restore status
          const restoredMedia = [...media];
          restoredMedia[index] = {
            ...restoredMedia[index],
            status: 'READY',
          };
          setMedia(restoredMedia);
        });
    }
  };

  const handleUpdateAlt = (index: number, alt: string) => {
    const newMedia = [...media];
    newMedia[index] = {
      ...newMedia[index],
      alt,
    };
    setMedia(newMedia);
    
    // If it's an existing media item, update it
    if (newMedia[index].id) {
      products.updateProductMedia(productId, newMedia[index].id!, alt)
        .catch((err) => {
          setError(`Failed to update alt text: ${err.message}`);
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadQueue.length === 0) {
      // If there are no files to upload, just call onSave
      if (onSave) {
        onSave(media);
      }
      return;
    }
    
    setIsSaving(true);
    setError(null);

    try {
      // Upload files
      const uploadPromises = uploadQueue.map(async (file, index) => {
        const mediaIndex = media.length - uploadQueue.length + index;
        
        // Create a FormData object for the file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Determine media type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const is3DModel = file.type.endsWith('gltf') || file.type.endsWith('glb');
        
        let mediaInput: any = {
          alt: media[mediaIndex].alt || file.name,
        };
        
        if (isImage) {
          mediaInput.mediaContentType = 'IMAGE';
          mediaInput.originalSource = URL.createObjectURL(file);
        } else if (isVideo) {
          mediaInput.mediaContentType = 'VIDEO';
          mediaInput.originalSource = URL.createObjectURL(file);
        } else if (is3DModel) {
          mediaInput.mediaContentType = 'MODEL_3D';
          mediaInput.originalSource = URL.createObjectURL(file);
        }
        
        // In a real implementation, you would upload the file to Shopify
        // For now, we'll simulate a successful upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the media item with the "uploaded" status
        const newMedia = [...media];
        newMedia[mediaIndex] = {
          ...newMedia[mediaIndex],
          status: 'READY',
          id: `gid://shopify/MediaImage/${Date.now() + index}`, // Simulate an ID
        };
        setMedia(newMedia);
        
        return mediaInput;
      });
      
      await Promise.all(uploadPromises);
      
      // Clear the upload queue
      setUploadQueue([]);
      
      if (onSave) {
        onSave(media);
      }
    } catch (err: any) {
      setError(`Failed to upload media: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
        </div>
      </Card>
    );
  }

  // Render the form with dual-view capability
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Product Media</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm"
          >
            Add Media
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            accept="image/*,video/*,.gltf,.glb"
          />
        </div>

        {/* Drag and drop area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive
              ? 'border-light-accent dark:border-dark-accent bg-light-accent/10 dark:bg-dark-accent/10'
              : 'border-light-ui dark:border-dark-ui'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-12 h-12 text-light-ui dark:text-dark-ui mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-light-fg dark:text-dark-fg">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-light-fg dark:text-dark-fg opacity-70">
              Images, videos, and 3D models (glTF/GLB)
            </p>
          </div>
        </div>

        {/* Media gallery */}
        {media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map((mediaItem, index) => (
              <div
                key={mediaItem.id || index}
                className="relative border border-light-ui dark:border-dark-ui rounded-md overflow-hidden"
              >
                <div className="relative pb-[100%] bg-light-ui dark:bg-dark-ui">
                  {mediaItem.previewImage ? (
                    <img
                      src={mediaItem.previewImage}
                      alt={mediaItem.alt || ''}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-light-fg dark:text-dark-fg opacity-50">
                      {mediaItem.mediaContentType === 'VIDEO' ? (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : mediaItem.mediaContentType === 'MODEL_3D' ? (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      ) : (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Status indicator */}
                  {mediaItem.status === 'PROCESSING' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={mediaItem.status === 'PROCESSING'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Alt text input */}
                <div className="p-2">
                  <input
                    type="text"
                    value={mediaItem.alt || ''}
                    onChange={(e) => handleUpdateAlt(index, e.target.value)}
                    placeholder="Alt text"
                    className="w-full px-2 py-1 text-sm border border-light-ui dark:border-dark-ui rounded bg-light-bg dark:bg-dark-bg"
                    disabled={mediaItem.status === 'PROCESSING'}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-light-ui dark:border-dark-ui rounded-md">
            <p className="text-light-fg dark:text-dark-fg opacity-70">
              No media added. Add media to showcase your product.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-light-ui dark:border-dark-ui space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Media'}
        </Button>
      </div>
    </form>
  );

  return (
    <DualView
      title="Product Media"
      presentationView={renderForm()}
      rawData={{ productId, media }}
      defaultView="presentation"
    />
  );
};

export default ProductMediaUploader;
