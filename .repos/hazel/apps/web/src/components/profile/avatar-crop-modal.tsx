import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Loader } from "~/components/ui/loader"
import {
	Modal,
	ModalBody,
	ModalClose,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { calculateInitialCrop, cropImage } from "~/utils/image-crop"
import { CropArea, type CropAreaHandle } from "./crop-area"

const OUTPUT_SIZE = 512

// Discriminated union for image loading state
type ImageState =
	| { status: "idle" }
	| { status: "loading" }
	| {
			status: "ready"
			element: HTMLImageElement
			dimensions: { width: number; height: number }
			crop: { x: number; y: number; size: number }
			src: string
	  }
	| {
			status: "processing"
			element: HTMLImageElement
			dimensions: { width: number; height: number }
			crop: { x: number; y: number; size: number }
			src: string
	  }

interface AvatarCropModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	imageFile: File | null
	onCropComplete: (croppedBlob: Blob) => void
}

export function AvatarCropModal({ isOpen, onOpenChange, imageFile, onCropComplete }: AvatarCropModalProps) {
	const [imageState, setImageState] = useState<ImageState>({ status: "idle" })
	const objectUrlRef = useRef<string | null>(null)
	const cropAreaRef = useRef<CropAreaHandle>(null)

	// Load image when file changes
	useEffect(() => {
		if (!imageFile) {
			setImageState({ status: "idle" })
			return
		}

		setImageState({ status: "loading" })
		const url = URL.createObjectURL(imageFile)
		objectUrlRef.current = url

		const img = new Image()
		img.onload = () => {
			const dimensions = { width: img.naturalWidth, height: img.naturalHeight }
			const crop = calculateInitialCrop(img.naturalWidth, img.naturalHeight)
			setImageState({
				status: "ready",
				element: img,
				dimensions,
				crop,
				src: url,
			})
		}
		img.onerror = () => {
			console.error("Failed to load image")
			setImageState({ status: "idle" })
			onOpenChange(false)
		}
		img.src = url

		return () => {
			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current)
				objectUrlRef.current = null
			}
		}
	}, [imageFile, onOpenChange])

	const handleSave = async () => {
		if (imageState.status !== "ready" || !cropAreaRef.current) return

		const cropRect = cropAreaRef.current.getCropRect()
		setImageState({ ...imageState, status: "processing" })
		try {
			const blob = await cropImage(imageState.element, cropRect, OUTPUT_SIZE)
			onCropComplete(blob)
		} catch (error) {
			console.error("Failed to crop image:", error)
			setImageState({ ...imageState, status: "ready" })
		}
	}

	const handleCancel = () => {
		onOpenChange(false)
	}

	const isReady = imageState.status === "ready" || imageState.status === "processing"
	const isProcessing = imageState.status === "processing"

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg" isDismissable={!isProcessing}>
				<ModalHeader>
					<ModalTitle>Crop profile picture</ModalTitle>
				</ModalHeader>
				<ModalBody className="flex items-center justify-center py-6">
					{isReady ? (
						<CropArea
							ref={cropAreaRef}
							imageSrc={imageState.src}
							imageWidth={imageState.dimensions.width}
							imageHeight={imageState.dimensions.height}
							initialCrop={imageState.crop}
						/>
					) : (
						<div className="flex h-64 items-center justify-center">
							<Loader className="size-8" />
						</div>
					)}
				</ModalBody>
				<ModalFooter>
					<ModalClose>
						<Button intent="outline" onPress={handleCancel} isDisabled={isProcessing}>
							Cancel
						</Button>
					</ModalClose>
					<Button onPress={handleSave} isDisabled={!isReady || isProcessing}>
						{isProcessing ? (
							<>
								<Loader data-slot="loader" />
								Saving...
							</>
						) : (
							"Save"
						)}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
