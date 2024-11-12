export const DEBUG = false;
export const OPENAI_MODEL = "gpt-4o";
export const BUTTON_STYLES = `
  .sponsor-skip-button {
    position: absolute;
    right: 20px;
    bottom: 60px;
    background: white;
    color: black;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 8px 16px;
    border-radius: 9999px;
    cursor: pointer;
    z-index: 1000;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .sponsor-skip-button:hover {
    background: #f8f8f8;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(0, 0, 0, 0.1);
  }
`;
