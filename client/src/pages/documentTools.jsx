import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../CSS/Pages/DocumentTools/documentTools.module.css";
import Footer from "../components/Layout/footer";

function DocumentTools() {
  const [fadeIn, setFadeIn] = useState(true);
  const navigate = useNavigate();

  const tools = [
    {
      id: 1,
      name: "Compress PDF",
      description: "Reduce PDF file size while maintaining quality",
      icon: "📄",
      path: "/compressor"
    },
    {
      id: 2,
      name: "Split and Merge PDF",
      description: "Combine multiple PDF files into one document",
      icon: "🔀",
      path: "/tools/documents/merge-pdf"
    },
    {
      id: 3,
      name: "Download from URL",
      description: "Download files directly from web URLs",
      icon: "⬇️",
      path: "/url-downloader"
    },
    {
      id: 4,
      name: "Auto Rename",
      description: "Automatically rename files with smart patterns",
      icon: "🔄",
      path: "/document-tools/auto-rename"
    },
    {
      id: 5,
      name: "Extract Images",
      description: "Extract all images from PDF documents",
      icon: "🖼️",
      path: "/document-tools/extract-images"
    },
    {
      id: 6,
      name: "Add Watermark",
      description: "Add watermarks to your PDF documents",
      icon: "💧",
      path: "/document-tools/watermark"
    }
  ];

  const handleToolClick = (tool) => {
    if (!tool.comingSoon) {
      navigate(tool.path);
    }
  };

  return (
    <div className={styles.documentToolsPage}>
      <div className={styles.documentToolsMain}>
        <div className={styles.documentToolsContent}>
          <div className={`${styles.pageContainer} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
            <h1 className={styles.mainTitle}>Document Tools</h1>
            
            <div className={styles.toolsGrid}>
              {tools.map((tool) => (
                <div 
                  key={tool.id} 
                  className={styles.toolCard}
                  onClick={() => navigate(tool.path)}
                >
                  <div className={styles.toolIcon}>
                    {tool.icon}
                  </div>
                  <div className={styles.toolContent}>
                    <h3 className={styles.toolName}>{tool.name}</h3>
                    <p className={styles.toolDescription}>{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DocumentTools;
