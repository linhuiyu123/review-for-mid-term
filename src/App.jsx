import React, { useEffect, useMemo, useState } from "react";
import questions from "./questions.js";

const TYPE_LABEL = { all: "全部", tf: "判断题", single: "单选题", fill: "程序填空" };
const LETTERS = ["A", "B", "C", "D"];

function normalize(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/[；;。.]$/g, "")
    .trim()
    .toLowerCase();
}

function isCorrect(question, selected, fillAnswers = {}) {
  if (!question) return false;
  if (question.type === "fill") {
    return question.answer.every((answer, index) => normalize(fillAnswers[index]) === normalize(answer));
  }
  return selected === question.answer;
}

function filterQuestions(list, filters) {
  const { mode, onlyWrong, keyword, wrongIds } = filters;
  const q = keyword.trim().toLowerCase();
  const wrongSet = new Set(wrongIds);
  return list.filter((item) => {
    const text = `${item.id} ${item.type} ${item.topic} ${item.prompt}`.toLowerCase();
    return (mode === "all" || item.type === mode) && (!onlyWrong || wrongSet.has(item.id)) && (!q || text.includes(q));
  });
}

function updateWrongIds(prev, id, correct) {
  const set = new Set(prev);
  if (correct) set.delete(id);
  else set.add(id);
  return [...set];
}

function topicStats(history) {
  const map = {};
  Object.entries(history || {}).forEach(([id, record]) => {
    const question = questions.find((item) => item.id === id);
    if (!question) return;
    map[question.topic] ??= { done: 0, wrong: 0 };
    map[question.topic].done += record.done || 0;
    map[question.topic].wrong += record.wrong || 0;
  });
  return Object.entries(map).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 8);
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

function runTests() {
  const tests = [];
  const add = (name, pass) => tests.push({ name, pass: Boolean(pass) });

  add("question count is 114", questions.length === 114);
  add("ids are unique", new Set(questions.map((q) => q.id)).size === questions.length);
  add("single questions have four options", questions.filter((q) => q.type === "single").every((q) => q.options?.length === 4));
  add("fill questions have matching blanks", questions.filter((q) => q.type === "fill").every((q) => q.answer.length === q.blanks));
  add("C40 answer is D", questions.find((q) => q.id === "C40")?.answer === "D");
  add("C47 answer is C", questions.find((q) => q.id === "C47")?.answer === "C");
  add("C19 has image", Boolean(questions.find((q) => q.id === "C19")?.image));
  add("fill answer normalizes semicolon", isCorrect(questions.find((q) => q.id === "F1"), "", { 0: "p", 1: "H->Elements[i] = H->Elements[i/2];" }));

  return tests;
}

const TESTS = runTests();

export default function App() {
  const [mode, setMode] = useState("all");
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [fillAnswers, setFillAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [wrongIds, setWrongIds] = useLocalStorage("ds_wrong_full_md_v1", []);
  const [stats, setStats] = useLocalStorage("ds_stats_full_md_v1", { done: 0, right: 0, wrong: 0, history: {} });
  const [saved, setSaved] = useLocalStorage("ds_progress_full_md_v1", null);

  const filtered = useMemo(
    () => filterQuestions(questions, { mode, onlyWrong, keyword, wrongIds }),
    [mode, onlyWrong, keyword, wrongIds]
  );

  const total = filtered.length;
  const currentIndex = total ? Math.min(index, total - 1) : 0;
  const question = filtered[currentIndex];
  const correct = isCorrect(question, selected, fillAnswers);
  const wrongSet = new Set(wrongIds);
  const accuracy = stats.done ? Math.round((stats.right / stats.done) * 100) : 0;
  const weak = topicStats(stats.history);
  const failedTests = TESTS.filter((test) => !test.pass);

  useEffect(() => {
    setIndex(0);
    resetInput();
  }, [mode, onlyWrong, keyword]);

  useEffect(() => {
    setSaved({ mode, onlyWrong, keyword, index, selected, fillAnswers, checked, wrongIds, stats, t: Date.now() });
  }, [mode, onlyWrong, keyword, index, selected, fillAnswers, checked, wrongIds, stats]);

  function resetInput() {
    setSelected("");
    setFillAnswers({});
    setChecked(false);
  }

  function submit() {
    if (!question || checked) return;
    setChecked(true);

    setStats((prev) => {
      const history = prev.history || {};
      const old = history[question.id] || { done: 0, right: 0, wrong: 0 };
      return {
        done: prev.done + 1,
        right: prev.right + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
        history: {
          ...history,
          [question.id]: {
            done: old.done + 1,
            right: old.right + (correct ? 1 : 0),
            wrong: old.wrong + (correct ? 0 : 1),
            last: correct ? "right" : "wrong",
          },
        },
      };
    });

    setWrongIds((prev) => updateWrongIds(prev, question.id, correct));
  }

  function go(step) {
    if (!total) return;
    setIndex((value) => (value + step + total) % total);
    resetInput();
  }

  function randomQuestion() {
    if (!total) return;
    setIndex(Math.floor(Math.random() * total));
    resetInput();
  }

  function saveNow() {
    setSaved({ mode, onlyWrong, keyword, index, selected, fillAnswers, checked, wrongIds, stats, t: Date.now() });
    alert("进度已保存到本机浏览器");
  }

  function loadSaved() {
    if (!saved) return alert("暂无已保存进度");
    setMode(saved.mode ?? "all");
    setOnlyWrong(Boolean(saved.onlyWrong));
    setKeyword(saved.keyword ?? "");
    setSelected(saved.selected ?? "");
    setFillAnswers(saved.fillAnswers ?? {});
    setChecked(Boolean(saved.checked));
    setWrongIds(saved.wrongIds ?? []);
    setStats(saved.stats ?? { done: 0, right: 0, wrong: 0, history: {} });
    setTimeout(() => setIndex(saved.index ?? 0), 0);
  }

  function resetAll() {
    setWrongIds([]);
    setStats({ done: 0, right: 0, wrong: 0, history: {} });
    resetInput();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ wrongIds, stats, saved }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ds-quiz-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <header style={S.head}>
          <div>
            <div style={S.muted}>📘 数据结构基础期中题库刷题站</div>
            <h1 style={S.h1}>刷题、判分、自动整理错题</h1>
            <p style={S.muted}>完整题干版：题目来自 Markdown 题库，图片题会显示原图；进度保存在浏览器本地。</p>
          </div>

          <div style={S.stats}>
            <Box k="已做" v={stats.done} />
            <Box k="正确率" v={`${accuracy}%`} />
            <Box k="错题" v={wrongIds.length} />
          </div>
        </header>

        <section style={S.toolbar}>
          <div style={S.tabs}>
            {Object.entries(TYPE_LABEL).map(([key, label]) => (
              <button key={key} style={{ ...S.tab, ...(mode === key ? S.active : {}) }} onClick={() => setMode(key)}>
                {label}
              </button>
            ))}
          </div>

          <div style={S.controls}>
            <input style={S.input} placeholder="搜索题号、专题或题干" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <label>
              <input type="checkbox" checked={onlyWrong} onChange={(event) => setOnlyWrong(event.target.checked)} /> 只看错题
            </label>
            <button style={S.btn2} onClick={randomQuestion}>随机</button>
          </div>
        </section>

        <main style={S.layout}>
          <section style={S.card}>
            {!question ? (
              <div style={S.empty}>没有符合条件的题目。</div>
            ) : (
              <Quiz
                question={question}
                index={currentIndex}
                total={total}
                selected={selected}
                setSelected={setSelected}
                fillAnswers={fillAnswers}
                setFillAnswers={setFillAnswers}
                checked={checked}
                correct={correct}
                wrongSet={wrongSet}
                submit={submit}
                go={go}
                toggleWrong={() => setWrongIds((prev) => prev.includes(question.id) ? prev.filter((id) => id !== question.id) : [...prev, question.id])}
              />
            )}
          </section>

          <aside style={S.side}>
            <Panel title="薄弱专题">
              {weak.length ? (
                weak.map(([topic, value]) => (
                  <div key={topic} style={S.row}>
                    <span>{topic}</span>
                    <span style={S.muted}>错 {value.wrong} / 做 {value.done}</span>
                  </div>
                ))
              ) : (
                <p style={S.muted}>做题后显示错题高频专题。</p>
              )}
            </Panel>

            <Panel title="题库概况">
              <div style={S.grid}>
                <Box k="判断题" v={30} />
                <Box k="单选题" v={77} />
                <Box k="程序填空" v={7} />
                <Box k="当前筛选" v={total} />
              </div>
              <div style={S.actions}>
                <button style={S.btn2} onClick={exportData}>导出</button>
                <button style={S.btn2} onClick={resetAll}>重置</button>
                <button style={S.link} onClick={() => setWrongIds([])}>清空错题</button>
              </div>
            </Panel>

            <Panel title="保存进度">
              <p style={S.muted}>最近保存：{saved?.t ? new Date(saved.t).toLocaleString() : "暂无"}</p>
              <div style={S.actions}>
                <button style={S.btn2} onClick={saveNow}>保存当前进度</button>
                <button style={S.btn2} onClick={loadSaved}>读取进度</button>
                <button style={S.link} onClick={() => setSaved(null)}>清除存档</button>
              </div>
            </Panel>

            <Panel title="自测状态">
              <p style={failedTests.length ? S.err : S.muted}>
                {failedTests.length ? `${failedTests.length} 项测试未通过` : `已通过 ${TESTS.length} 项核心测试`}
              </p>
            </Panel>
          </aside>
        </main>
      </div>
    </div>
  );
}

function Quiz({ question, index, total, selected, setSelected, fillAnswers, setFillAnswers, checked, correct, wrongSet, submit, go, toggleWrong }) {
  const needSelection = question.type !== "fill" && !selected;

  return (
    <div style={S.quiz}>
      <div style={S.meta}>
        <div>
          <b style={S.badge}>{question.id}</b>{" "}
          <b style={S.dark}>{TYPE_LABEL[question.type]}</b>{" "}
          <b style={S.badge}>{question.topic}</b>{" "}
          {wrongSet.has(question.id) && <b style={S.red}>★ 错题</b>}
        </div>
        <span style={S.muted}>{index + 1}/{total}</span>
      </div>

      <div style={S.prompt}><RichText text={question.prompt} /></div>

      {question.image && (
        <div style={S.imgBox}>
          <img src={question.image} alt={`${question.id} figure`} style={S.img} />
        </div>
      )}

      {question.type === "tf" && (
        <Choices options={["T", "F"]} selected={selected} setSelected={setSelected} checked={checked} answer={question.answer} />
      )}

      {question.type === "single" && (
        <Choices options={question.options} selected={selected} setSelected={setSelected} checked={checked} answer={question.answer} letters />
      )}

      {question.type === "fill" && (
        Array.from({ length: question.blanks }).map((_, i) => (
          <input
            key={i}
            style={S.inputFull}
            placeholder={`第 ${i + 1} 空`}
            disabled={checked}
            value={fillAnswers[i] || ""}
            onChange={(event) => setFillAnswers({ ...fillAnswers, [i]: event.target.value })}
          />
        ))
      )}

      <div style={S.actions}>
        <button style={S.btn} disabled={checked || needSelection} onClick={submit}>提交答案</button>
        <button style={S.btn2} onClick={() => go(-1)}>上一题</button>
        <button style={S.btn2} onClick={() => go(1)}>下一题</button>
        <button style={S.link} onClick={toggleWrong}>{wrongSet.has(question.id) ? "移出错题" : "加入错题"}</button>
      </div>

      {checked && (
        <div style={{ ...S.result, ...(correct ? S.good : S.bad) }}>
          <b>{correct ? "✓ 回答正确" : "✕ 回答错误"}</b>
          <p>正确答案：<Answer question={question} /></p>
        </div>
      )}
    </div>
  );
}

function Choices({ options, selected, setSelected, checked, answer, letters = false }) {
  return (
    <div style={S.choices}>
      {options.map((option, i) => {
        const key = letters ? LETTERS[i] : option;
        return (
          <button
            key={key}
            disabled={checked}
            onClick={() => setSelected(key)}
            style={{
              ...S.choice,
              ...(selected === key ? S.chosen : {}),
              ...(checked && key === answer ? S.good : {}),
              ...(checked && selected === key && key !== answer ? S.bad : {}),
            }}
          >
            <b>{letters ? `${key}.` : key}</b>
            <span style={S.option}><RichText text={option} /></span>
          </button>
        );
      })}
    </div>
  );
}

function RichText({ text }) {
  const value = String(text ?? "");
  const nodes = [];
  const chunks = value.split("```");

  chunks.forEach((chunk, chunkIndex) => {
    if (chunkIndex % 2 === 1) {
      const clean = chunk.replace(/^c\n/, "").trim();
      nodes.push(
        <pre key={`code-${chunkIndex}`} style={S.codeBlock}>
          <code>{clean}</code>
        </pre>
      );
      return;
    }

    chunk.split("\n").forEach((line, lineIndex) => {
      if (!line.trim()) {
        nodes.push(<div key={`gap-${chunkIndex}-${lineIndex}`} style={{ height: 8 }} />);
      } else {
        nodes.push(<div key={`line-${chunkIndex}-${lineIndex}`}>{renderInline(line)}</div>);
      }
    });
  });

  return <>{nodes}</>;
}

function renderInline(text) {
  const nodes = [];
  let i = 0;

  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        nodes.push(<strong key={nodes.length}>{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }

    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        nodes.push(<code key={nodes.length} style={S.inlineCode}>{text.slice(i + 1, end)}</code>);
        i = end + 1;
        continue;
      }
    }

    if (text[i] === "$") {
      const end = text.indexOf("$", i + 1);
      if (end !== -1) {
        nodes.push(<span key={nodes.length} style={S.math}>{renderMath(text.slice(i + 1, end))}</span>);
        i = end + 1;
        continue;
      }
    }

    let next = text.length;
    ["**", "`", "$"].forEach((mark) => {
      const pos = text.indexOf(mark, i + 1);
      if (pos !== -1 && pos < next) next = pos;
    });

    nodes.push(text.slice(i, next));
    i = next;
  }

  return nodes;
}

function renderMath(expr) {
  const nodes = [];

  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === "_" && i + 1 < expr.length) {
      let sub = "";

      if (expr[i + 1] === "{") {
        const end = expr.indexOf("}", i + 2);
        if (end !== -1) {
          sub = expr.slice(i + 2, end);
          i = end;
        }
      } else {
        sub = expr[i + 1];
        i += 1;
      }

      nodes.push(<sub key={nodes.length}>{sub}</sub>);
    } else if (expr[i] === "^") {
      let sup = "";

      if (expr[i + 1] === "{") {
        const end = expr.indexOf("}", i + 2);
        if (end !== -1) {
          sup = expr.slice(i + 2, end);
          i = end;
        }
      } else if (i + 1 < expr.length) {
        sup = expr[i + 1];
        i += 1;
      }

      nodes.push(<sup key={nodes.length}>{sup}</sup>);
    } else if (expr.startsWith("\\log", i)) {
      nodes.push("log");
      i += 3;
    } else if (expr.startsWith("\\sqrt", i)) {
      nodes.push("√");
      i += 4;
    } else if (expr.startsWith("\\Omega", i)) {
      nodes.push("Ω");
      i += 5;
    } else if (expr.startsWith("\\Theta", i)) {
      nodes.push("Θ");
      i += 5;
    } else if (expr.startsWith("\\cdot", i)) {
      nodes.push("·");
      i += 4;
    } else if (expr.startsWith("\\le", i)) {
      nodes.push("≤");
      i += 2;
    } else if (expr.startsWith("\\ge", i)) {
      nodes.push("≥");
      i += 2;
    } else if (expr[i] !== "\\") {
      nodes.push(expr[i]);
    }
  }

  return nodes;
}

function Answer({ question }) {
  if (question.type === "fill") {
    return <code>{question.answer.map((item, i) => `${i + 1}. ${item}`).join("； ")}</code>;
  }

  if (question.type === "single") {
    return <code>{question.answer}. {question.options[LETTERS.indexOf(question.answer)]}</code>;
  }

  return <code>{question.answer}</code>;
}

function Box({ k, v }) {
  return (
    <div style={S.box}>
      <small>{k}</small>
      <b>{v}</b>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section style={S.panel}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "system-ui,-apple-system,Segoe UI,sans-serif", padding: 24 },
  wrap: { maxWidth: 1180, margin: "0 auto" },
  head: { display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "end", marginBottom: 20 },
  h1: { fontSize: 40, margin: "6px 0" },
  muted: { color: "#64748b", lineHeight: 1.6 },
  stats: { display: "grid", gridTemplateColumns: "repeat(3,90px)", gap: 10 },
  box: { background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12, textAlign: "center", display: "grid", gap: 4 },
  toolbar: { background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 14, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 },
  tabs: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, minWidth: 340 },
  tab: { border: 0, borderRadius: 10, padding: "10px 12px", background: "#f1f5f9", fontWeight: 700, cursor: "pointer" },
  active: { background: "#0f172a", color: "white" },
  controls: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  input: { height: 38, border: "1px solid #cbd5e1", borderRadius: 10, padding: "0 10px", minWidth: 230 },
  layout: { display: "grid", gridTemplateColumns: "1fr 310px", gap: 20 },
  card: { background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, minHeight: 520 },
  side: { display: "flex", flexDirection: "column", gap: 12 },
  panel: { background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 16 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  row: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", padding: "8px 0" },
  empty: { padding: 90, textAlign: "center", color: "#64748b" },
  quiz: { display: "flex", flexDirection: "column", gap: 18 },
  meta: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  badge: { border: "1px solid #cbd5e1", borderRadius: 999, padding: "4px 8px", fontSize: 12 },
  dark: { background: "#0f172a", color: "white", borderRadius: 999, padding: "4px 8px", fontSize: 12 },
  red: { background: "#dc2626", color: "white", borderRadius: 999, padding: "4px 8px", fontSize: 12 },
  prompt: { fontSize: 20, lineHeight: 1.65, margin: 0 },
  choices: { display: "grid", gap: 10 },
  choice: { width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: 14, background: "white", padding: 14, cursor: "pointer", display: "flex", gap: 12 },
  option: { lineHeight: 1.55 },
  chosen: { borderColor: "#0f172a", boxShadow: "0 0 0 3px rgba(15,23,42,.08)" },
  good: { background: "#ecfdf5", borderColor: "#10b981" },
  bad: { background: "#fef2f2", borderColor: "#ef4444" },
  inputFull: { border: "1px solid #cbd5e1", borderRadius: 10, padding: 12, fontFamily: "monospace" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  btn: { border: 0, borderRadius: 10, padding: "10px 14px", background: "#0f172a", color: "white", fontWeight: 700, cursor: "pointer" },
  btn2: { border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 14px", background: "white", fontWeight: 700, cursor: "pointer" },
  link: { border: 0, background: "transparent", padding: "10px 14px", fontWeight: 700, cursor: "pointer" },
  result: { border: "1px solid", borderRadius: 16, padding: 14 },
  imgBox: { border: "1px solid #e2e8f0", borderRadius: 14, padding: 10, background: "#fff", textAlign: "center" },
  img: { maxWidth: "100%", maxHeight: 360, objectFit: "contain" },
  inlineCode: { fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, padding: "1px 5px", fontSize: "0.92em" },
  math: { fontFamily: "Georgia,Times New Roman,serif", fontStyle: "italic", background: "#f8fafc", borderRadius: 4, padding: "0 2px" },
  codeBlock: { background: "#0f172a", color: "#e2e8f0", borderRadius: 12, padding: 14, overflowX: "auto", fontSize: 14, lineHeight: 1.5 },
  err: { color: "#b91c1c" },
};
