import React, { useState, useRef, useEffect, useCallback } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import styles from "../../CSS/Pages/fileConverter.module.css";
import PositionControls from "./components/PositionControls";
import TextControls from "./components/TextControls";
import PDFControls from "./components/PDFControls";
import PreviewContainer from "./components/PreviewContainer";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function WatermarkPage({ fadeIn, files, watermarkType, setWatermarkType, watermarkText, setWatermarkText, watermarkImage, setWatermarkImage, watermarkImageUrl, setWatermarkImageUrl, anchorPosition, setAnchorPosition, offsetX, setOffsetX, offsetY, setOffsetY, watermarkOpacity, setWatermarkOpacity, watermarkColor, setWatermarkColor, fontFamily, setFontFamily, fontSize, setFontSize, rotation, setRotation, strokeEnabled, setStrokeEnabled, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth, pdfPages, setPdfPages, pdfPageRange, setPdfPageRange, tiledMode, setTiledMode, onProcess, error, previewUrls }) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [pdfRendering, setPdfRendering] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState("fit-width");
  
  const imageRef = useRef(null);
  const previewContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const assetFrameRef = useRef(null);

  const currentFile = files[previewIndex];
  const isVideo = currentFile && /\.(mp4|avi|mov|mkv|wmv|flv|webm|m4v)$/i.test(currentFile.name);
  const isPDF = currentFile && currentFile.name.toLowerCase().endsWith('.pdf');
  const hasPDF = files.some(f => f.name.toLowerCase().endsWith('.pdf'));

  const handleWatermarkImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWatermarkImage(file);
      setWatermarkImageUrl(URL.createObjectURL(file));
    }
  };

  const loadPDF = useCallback(async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) return;
    try {
      setPdfRendering(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (await pdfjsLib.getDocument({ data: arrayBuffer })).promise;
      setPdfDoc(pdf);
      setTotalPdfPages(pdf.numPages);
      setCurrentPdfPage(1);
    } catch (error) {
      console.error('PDF load error:', error);
    } finally {
      setPdfRendering(false);
    }
  }, []);

  const renderPDFPage = useCallback(async (pageNum) => {
    if (!pdfDoc || !canvasRef.current || !previewContainerRef.current) return;
    try {
      setPdfRendering(true);
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 1.0 });
      const containerWidth = previewContainerRef.current.offsetWidth - 40;
      const containerHeight = previewContainerRef.current.offsetHeight - 100;
      
      let scale = viewMode === "fit-width" ? containerWidth / viewport.width :
                  viewMode === "fit-height" ? containerHeight / viewport.height : 1.0;
      scale *= (zoomLevel / 100);
      
      const scaledViewport = page.getViewport({ scale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      setImageDimensions({ width: scaledViewport.width, height: scaledViewport.height });
      
      await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
    } catch (error) {
      console.error('PDF render error:', error);
    } finally {
      setPdfRendering(false);
    }
  }, [pdfDoc, viewMode, zoomLevel]);

  useEffect(() => {
    if (currentFile && isPDF) loadPDF(currentFile);
    else { setPdfDoc(null); setTotalPdfPages(0); }
  }, [files, previewIndex, isPDF, loadPDF, currentFile]);

  useEffect(() => {
    if (pdfDoc && currentPdfPage) renderPDFPage(currentPdfPage);
  }, [pdfDoc, currentPdfPage, renderPDFPage]);

  useEffect(() => {
    return () => { if (watermarkImageUrl) URL.revokeObjectURL(watermarkImageUrl); };
  }, [watermarkImageUrl]);

  useEffect(() => {
    const positions = { "top-left": { x: 10, y: 10 }, "top-center": { x: 50, y: 10 }, "top-right": { x: 90, y: 10 }, "middle-left": { x: 10, y: 50 }, "center": { x: 50, y: 50 }, "middle-right": { x: 90, y: 50 }, "bottom-left": { x: 10, y: 90 }, "bottom-center": { x: 50, y: 90 }, "bottom-right": { x: 90, y: 90 } };
    setWatermarkPosition(positions[anchorPosition] || { x: 90, y: 90 });
  }, [anchorPosition]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth || imageRef.current.videoWidth,
        height: imageRef.current.naturalHeight || imageRef.current.videoHeight
      });
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && previewContainerRef.current && assetFrameRef.current) {
      const rect = assetFrameRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setWatermarkPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getWatermarkStyle = () => {
    if (!imageDimensions.width || !imageDimensions.height) return {};
    const actualFontSize = (fontSize / 100) * Math.min(imageDimensions.width, imageDimensions.height);
    
    const baseStyle = {
      position: 'absolute',
      color: watermarkColor,
      fontSize: `${actualFontSize}px`,
      fontFamily: fontFamily,
      fontWeight: 'bold',
      opacity: watermarkOpacity,
      pointerEvents: 'auto',
      whiteSpace: 'nowrap',
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      transformOrigin: 'center',
      zIndex: 10,
      cursor: isDragging ? 'grabbing' : 'grab',
      ...(strokeEnabled && { WebkitTextStroke: `${strokeWidth}px ${strokeColor}`, paintOrder: 'stroke fill' })
    };

    const positions = { "top-left": { x: 10, y: 10 }, "top-center": { x: 50, y: 10 }, "top-right": { x: 90, y: 10 }, "middle-left": { x: 10, y: 50 }, "center": { x: 50, y: 50 }, "middle-right": { x: 90, y: 50 }, "bottom-left": { x: 10, y: 90 }, "bottom-center": { x: 50, y: 90 }, "bottom-right": { x: 90, y: 90 } };
    const anchorDefault = positions[anchorPosition] || { x: 90, y: 90 };
    const usingAnchor = Math.abs(watermarkPosition.x - anchorDefault.x) < 1 && Math.abs(watermarkPosition.y - anchorDefault.y) < 1;
    
    if (usingAnchor) {
      const finalX = anchorPosition.includes('left') ? `${offsetX}px` : anchorPosition.includes('right') ? `calc(100% - ${offsetX}px)` : '50%';
      const finalY = anchorPosition.includes('top') ? `${offsetY}px` : anchorPosition.includes('bottom') ? `calc(100% - ${offsetY}px)` : '50%';
      return { ...baseStyle, left: finalX, top: finalY };
    }
    return { ...baseStyle, left: `${watermarkPosition.x}%`, top: `${watermarkPosition.y}%` };
  };

  const getWatermarkImageStyle = () => {
    if (!imageDimensions.width || !imageDimensions.height) return {};
    const baseStyle = {
      position: 'absolute',
      opacity: watermarkOpacity,
      pointerEvents: 'auto',
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      transformOrigin: 'center',
      zIndex: 10,
      maxWidth: '30%',
      maxHeight: '30%',
      cursor: isDragging ? 'grabbing' : 'grab'
    };

    const positions = { "top-left": { x: 10, y: 10 }, "top-center": { x: 50, y: 10 }, "top-right": { x: 90, y: 10 }, "middle-left": { x: 10, y: 50 }, "center": { x: 50, y: 50 }, "middle-right": { x: 90, y: 50 }, "bottom-left": { x: 10, y: 90 }, "bottom-center": { x: 50, y: 90 }, "bottom-right": { x: 90, y: 90 } };
    const anchorDefault = positions[anchorPosition] || { x: 90, y: 90 };
    const usingAnchor = Math.abs(watermarkPosition.x - anchorDefault.x) < 1 && Math.abs(watermarkPosition.y - anchorDefault.y) < 1;
    
    if (usingAnchor) {
      const finalX = anchorPosition.includes('left') ? `${offsetX}px` : anchorPosition.includes('right') ? `calc(100% - ${offsetX}px)` : '50%';
      const finalY = anchorPosition.includes('top') ? `${offsetY}px` : anchorPosition.includes('bottom') ? `calc(100% - ${offsetY}px)` : '50%';
      return { ...baseStyle, left: finalX, top: finalY };
    }
    return { ...baseStyle, left: `${watermarkPosition.x}%`, top: `${watermarkPosition.y}%` };
  };

  return (
    <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Settings Panel */}
        <div style={{ flex: '0 0 420px', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          <div className={styles.conversionBox}>
            <h2 className={styles.conversionTitle}>Watermark Settings</h2>

            {/* Type Selection */}
            <div className={styles.formatOptions}>
              <label className={styles.formatLabel}>Type</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={`${styles.formatOption} ${watermarkType === "text" ? styles.selectedFormat : ""}`} onClick={() => setWatermarkType("text")} style={{ flex: 1, padding: '12px' }}>Text</button>
                <button className={`${styles.formatOption} ${watermarkType === "image" ? styles.selectedFormat : ""}`} onClick={() => setWatermarkType("image")} style={{ flex: 1, padding: '12px' }}>Image</button>
              </div>
            </div>

            {/* Content Section */}
            {watermarkType === "text" ? (
              <TextControls watermarkText={watermarkText} setWatermarkText={setWatermarkText} fontFamily={fontFamily} setFontFamily={setFontFamily} fontSize={fontSize} setFontSize={setFontSize} watermarkColor={watermarkColor} setWatermarkColor={setWatermarkColor} strokeEnabled={strokeEnabled} setStrokeEnabled={setStrokeEnabled} strokeColor={strokeColor} setStrokeColor={setStrokeColor} strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth} />
            ) : (
              <div className={styles.formatOptions}>
                <label className={styles.formatLabel}>Watermark Image</label>
                <label style={{ display: 'block', width: '100%', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed rgba(94, 200, 255, 0.4)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' }}>
                  {watermarkImageUrl ? (
                    <div><img src={watermarkImageUrl} alt="Watermark" style={{ maxWidth: '100%', maxHeight: '100px', marginBottom: '10px' }} /><p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>Click to change</p></div>
                  ) : (
                    <><div style={{ fontSize: '40px', marginBottom: '10px' }}>🖼️</div><p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>Click to upload image</p></>
                  )}
                  <input type="file" accept="image/*" onChange={handleWatermarkImageSelect} style={{ display: 'none' }} />
                </label>
              </div>
            )}

            {/* Position */}
            <PositionControls anchorPosition={anchorPosition} setAnchorPosition={setAnchorPosition} offsetX={offsetX} setOffsetX={setOffsetX} offsetY={offsetY} setOffsetY={setOffsetY} />

            {/* Appearance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label className={styles.formatLabel} style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                <input type="range" min="0" max="1" step="0.05" value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))} style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', outline: 'none', cursor: 'pointer' }} />
              </div>
              <div>
                <label className={styles.formatLabel} style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>Rotation: {rotation}°</label>
                <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', outline: 'none', cursor: 'pointer' }} />
              </div>
            </div>

            {/* PDF Controls */}
            {hasPDF && <PDFControls pdfPages={pdfPages} setPdfPages={setPdfPages} pdfPageRange={pdfPageRange} setPdfPageRange={setPdfPageRange} tiledMode={tiledMode} setTiledMode={setTiledMode} currentPdfPage={currentPdfPage} setCurrentPdfPage={setCurrentPdfPage} totalPdfPages={totalPdfPages} />}

            {/* File Queue */}
            {files.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <label className={styles.formatLabel}>Files ({files.length})</label>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0' }}>
                  {files.map((file, index) => (
                    <button key={index} onClick={() => setPreviewIndex(index)} style={{ padding: '8px 12px', background: previewIndex === index ? 'rgba(94, 200, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)', border: `2px solid ${previewIndex === index ? '#5ec8ff' : 'rgba(94, 200, 255, 0.2)'}`, borderRadius: '6px', color: '#ffffff', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {index + 1}. {file.name.substring(0, 15)}{file.name.length > 15 ? '...' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <div className={styles.errorBox}>{error}</div>}

            <button className={styles.convertButton} onClick={onProcess} disabled={(watermarkType === "text" && !watermarkText.trim()) || (watermarkType === "image" && !watermarkImage)}>
              Apply to {files.length} File{files.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <PreviewContainer previewContainerRef={previewContainerRef} assetFrameRef={assetFrameRef} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} viewMode={viewMode} setViewMode={setViewMode}>
          {isPDF ? (
            <>
              <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
              {!pdfRendering && (watermarkType === "text" ? watermarkText : watermarkImageUrl) && (
                <div style={watermarkType === "text" ? getWatermarkStyle() : getWatermarkImageStyle()} onMouseDown={handleMouseDown}>
                  {watermarkType === "text" ? watermarkText : <img src={watermarkImageUrl} alt="Watermark" style={{ display: 'block', maxWidth: '200px' }} />}
                </div>
              )}
            </>
          ) : isVideo ? (
            <>
              <video ref={imageRef} src={previewUrls[previewIndex]} style={{ maxWidth: '100%', maxHeight: '600px', display: 'block', borderRadius: '8px' }} controls onLoadedMetadata={handleImageLoad} />
              {(watermarkType === "text" ? watermarkText : watermarkImageUrl) && (
                <div style={watermarkType === "text" ? getWatermarkStyle() : getWatermarkImageStyle()} onMouseDown={handleMouseDown}>
                  {watermarkType === "text" ? watermarkText : <img src={watermarkImageUrl} alt="Watermark" style={{ display: 'block', maxWidth: '200px' }} />}
                </div>
              )}
            </>
          ) : previewUrls[previewIndex] ? (
            <>
              <img ref={imageRef} src={previewUrls[previewIndex]} alt="Preview" style={{ maxWidth: '100%', maxHeight: '600px', display: 'block', borderRadius: '8px' }} onLoad={handleImageLoad} />
              {(watermarkType === "text" ? watermarkText : watermarkImageUrl) && (
                <div style={watermarkType === "text" ? getWatermarkStyle() : getWatermarkImageStyle()} onMouseDown={handleMouseDown}>
                  {watermarkType === "text" ? watermarkText : <img src={watermarkImageUrl} alt="Watermark" style={{ display: 'block', maxWidth: '200px' }} />}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>No preview</div>
          )}
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>{currentFile?.name}</p>
        </PreviewContainer>
      </div>
    </div>
  );
}

export default WatermarkPage;
