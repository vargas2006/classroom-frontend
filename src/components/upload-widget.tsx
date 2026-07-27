import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/constants';
import { UploadWidgetValue, UploadWidgetProps } from '@/types';
import { UploadCloud } from 'lucide-react';
import {useState, useRef, useEffect} from 'react'

interface ExtendedUploadWidgetProps extends UploadWidgetProps {
    disable?: boolean;
}

const UploadWidget = ({value = null, onChange, disable = false}: ExtendedUploadWidgetProps) => {
    const widgetRef = useRef<CloudinaryWidget | null>(null)
    const onCHangeRef = useRef(onChange);
    
    const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
    const [deleteToken, setDeleteToken] = useState<string | null>(null);



    useEffect(() => {
        setPreview(value);
    }, [value])

    useEffect(() => {
        onCHangeRef.current = onChange;
    }, [onChange])

    useEffect(()=>{
        if(typeof window === 'undefined') return;
        const initializeWidget = () => {
            if(!window.cloudinary || widgetRef.current) return false;

            widgetRef.current = window.cloudinary.createUploadWidget({
                cloudName: CLOUDINARY_CLOUD_NAME,
                uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                multiple: false,
                folder: 'uploads',
                maxFileSize: 5000000,
                clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp']
                
            }, (error, result) => {
                if(!error && result.event === 'success') {
                    const payload: UploadWidgetValue = {
                        url: result.info.secure_url,
                        publicId: result.info.public_id,
                    }

                    setPreview(payload);

                    setDeleteToken(result.info.delete_token ?? null)
                    onCHangeRef.current?.(payload)
                }
            });

            return true;
            
        }
        if(initializeWidget()) return;

        const intervalId = setInterval(()=>{
            if(initializeWidget()){
                window.clearInterval(intervalId);
            }
        }, 500);
        return () => window.clearInterval(intervalId);
    }, [])
    
    const openWidget = () => {
        if(!disable) widgetRef.current?.open()
    }
    


    return (
        <div className="space-y-2">
            {preview ? (
                <div className="upload-preview cursor-pointer" role="button" tabIndex={0} onClick={openWidget}>
                    <img src={preview.url} alt="preview" />
                </div>
            ) : <div className="upload-dropzone" role="button" tabIndex={0}
            onClick={openWidget} onKeyDown={(event) => {
                event.preventDefault();
                openWidget();
            }}> <div className="upload-prompt">
                <UploadCloud className="icon" />
                <div>
                    <p>Click to upload photo</p>
                    <p>PNG, JPG, and GIF up to 5MB</p>
                </div>
            </div>
            </div>}
        </div>
    )
}

export default UploadWidget