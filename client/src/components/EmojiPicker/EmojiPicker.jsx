import { useCallback, useRef, useState } from "react";
import emojiData from "unicode-emoji-json/data-by-group";
import styles from "./EmojiPicker.module.css";

function EmojiSection({ search, group, onSelect, sectionRef }) {
  return (
    <>
      {!search && (
        <p className={styles.groupTitle} ref={sectionRef}>
          {group.name}
        </p>
      )}
      {group.emojis.map((emoji) => {
        if (search && !emoji.name.toLowerCase().includes(search)) return;
        return (
          <button
            key={emoji.name}
            type="button"
            onClick={() => onSelect?.(emoji.emoji)}
          >
            {emoji.emoji}
          </button>
        );
      })}
    </>
  );
}

function EmojiPicker({ onSelect }) {
  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState(null);

  const timeoutRef = useRef(null);
  const emojisContainerRef = useRef();

  const scrollToSelected = useCallback((node) => {
    const emojisContainer = emojisContainerRef.current;

    if (!emojisContainer || !node) return;

    const containerTop = emojisContainer.getBoundingClientRect().top;
    const sectionTop = node.getBoundingClientRect().top;

    emojisContainer.scrollTo({
      top: emojisContainer.scrollTop + (sectionTop - containerTop),
      behavior: "instant",
    });
  }, []);

  const handleInputChange = (e) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(
      () => setSearch(e.target.value.trim()),
      1000,
    );
  };

  return (
    <div className={styles.primaryContainer}>
      <div className={styles.inputContainer}>
        <input
          type="text"
          name="query"
          id="query"
          autoComplete="off"
          placeholder="Type to search..."
          onChange={handleInputChange}
        />
      </div>
      <div className={styles.emojisContainer} ref={emojisContainerRef}>
        {emojiData.map((group) => (
          <EmojiSection
            key={group.slug}
            group={group}
            search={search.toLowerCase()}
            onSelect={onSelect}
            sectionRef={
              selectedSection === group.slug ? scrollToSelected : undefined
            }
          />
        ))}
      </div>
      <nav className={styles.groupNav}>
        {emojiData.map((group) => (
          <button
            key={group.slug}
            type="button"
            onClick={() => setSelectedSection(group.slug)}
          >
            {group.emojis[0].emoji}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default EmojiPicker;
