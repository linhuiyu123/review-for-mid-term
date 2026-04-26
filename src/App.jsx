import React, { useEffect, useMemo, useState } from "react";

// Canvas 单文件压缩版：把题库数据改为短字段，避免超出画布长度限制。
// q: [id, type, topic, prompt, options, answer, tip]
const L={all:"全部",tf:"判断题",single:"单选题",fill:"程序填空"}, ABC=["A","B","C","D","E"];
const q=(id,type,topic,prompt,options,answer,tip="")=>({id,type,topic,prompt,options,answer,tip});
const Q=[
q("T1","tf","tree","If the postorder and inorder traversal sequences of a binary tree are the same, then none of the nodes in the tree has a right child.",null,"T"),
q("T2","tf","complexity","N(logN)^2 is O(N^2).",null,"T"),
q("T3","tf","linear-list","If the most commonly used operations are random visit and inserting/deleting the last element, sequential storage works fastest.",null,"T"),
q("T4","tf","stack","Input sequence onto a stack is {1,2,3,...,N}. If the first output is i, then the j-th output must be j-i-1.",null,"F"),
q("T5","tf","sorting","The best worst-case time complexity for comparison-based sorting is O(N log N).",null,"T"),
q("T6","tf","BST","In a BST, keys on the same level from left to right must be non-decreasing.",null,"T"),
q("T7","tf","linear-list","For a sequential list of length N, query and insertion are O(1) and O(N), respectively.",null,"T"),
q("T8","tf","complexity","N^2 logN and N log(N^2) have the same speed of growth.",null,"F"),
q("T9","tf","stack","Push {1,2,3,4,5}; output {3,4,1,2,5} is impossible.",null,"T"),
q("T10","tf","graph","In a directed graph, the sum of all in-degrees and out-degrees is twice the total number of edges.",null,"T"),
q("T11","tf","graph","In a directed graph, the sum of in-degrees equals the sum of out-degrees.",null,"T"),
q("T12","tf","linear-list","For a sequential list, deleting first and inserting last are O(1) and O(N), respectively.",null,"F"),
q("T13","tf","complexity","2^N and N^N have the same speed of growth.",null,"F"),
q("T14","tf","sorting","If an integer array has fewer than 20 inversions, insertion sort is best among quick, heap and insertion sort.",null,"T"),
q("T15","tf","complexity","N log(N^2) and N logN have the same speed of growth.",null,"T"),
q("T16","tf","linked-list","If a linear list is represented by a linked list, element addresses must be consecutive.",null,"F"),
q("T17","tf","ADT","ADT is the abbreviation for Abstract Data Type.",null,"T"),
q("T18","tf","disjoint-set","Union-by-size guarantees depth no more than N/2, but not O(logN).",null,"F"),
q("T19","tf","complexity","N is O(sqrt(N) logN).",null,"F"),
q("T20","tf","queue","In an array circular queue, front must always be no larger than rear.",null,"F"),
q("T21","tf","tree","In a tree of degree 3, n2+n3 >= n0, where ni is the number of degree-i nodes.",null,"F"),
q("T22","tf","linked-list","Binary search on an increasing singly linked list has average time O(logN).",null,"F"),
q("T23","tf","BST","For a BST, preorder traversal gives nodes in non-increasing order.",null,"F"),
q("T24","tf","complexity","log(N!) = Ω(N logN).",null,"T"),
q("T25","tf","heap","The preorder traversal of any min-heap must be sorted non-decreasing.",null,"F"),
q("T26","tf","tree","Every node in a tree is the root of some subtree.",null,"T"),
q("T27","tf","tree","If preorder of a binary tree is ABC, then CAB cannot be its inorder traversal.",null,"T"),
q("T28","tf","BST","Searching 63 in a BST may follow {39,101,25,80,70,59,63}.",null,"F"),
q("T29","tf","algorithm","For two sorted lists, the fastest scan algorithm for union/intersection is linear.",null,"T"),
q("T30","tf","stack","Push sequence {1..n}; if x2=n in the popping sequence, there are 2 possible popping sequences.",null,"F"),

q("C1","single","BST","For a BST, which traversal gives a non-decreasing sequence?",["preorder","postorder","inorder","level-order"],"C"),
q("C2","single","sorting","Correct relation of extra space: heap sort, quick sort, merge sort.",["heap < merge < quick","heap > merge > quick","heap < quick < merge","heap > quick > merge"],"C"),
q("C3","single","stack","Push {1,2,3,4,5}. If first popped is 4, the last popped must be:",["1","3","5","1 or 5"],"D"),
q("C4","single","heap","Insert {5,2,7,3,4,1,6} into min-heap. Preorder:",["1,3,2,5,4,7,6","1,2,3,4,5,7,6","1,2,5,3,4,7,6","1,3,5,4,2,7,6"],"D"),
q("C5","single","tree","Tree of degree 4: n2=4,n3=2,n4=1. Leaf count:",["8","12","18","20"],"B"),
q("C6","single","tree","Binary tree height h, only degree 0 and 2 nodes. Min/max node count:",["2h, 2^h-1","2h-1, 2^h-1","2h-1, 2^(h-1)-1","2^(h-1)+1, 2^h-1"],"B"),
q("C7","single","queue","Circular queue array size m. Given front and size, rear element is at:",["front+size","front+size-1","(front+size)%m","(front+size-1)%m"],"D"),
q("C8","single","heap","Min-heap {1,3,2,5,4,7,6}; build max-heap linearly. Inorder:",["3,5,4,2,6,1,7","1,4,3,7,2,6,5","3,5,4,7,2,6,1","4,1,3,7,6,2,5"],"C"),
q("C9","single","sorting","Which sort may have no elements in final positions before the last run?",["bubble sort","insertion sort","heap sort","quick sort"],"B"),
q("C10","single","linked-list","Delete p from a doubly linked list:",["p->prior=p->prior->prior; p->prior->next=p;","p->next->prior=p; p->next=p->next->next;","p->prior->next=p->next; p->next->prior=p->prior;","p->next=p->prior->prior; p->prior=p->next->next;"],"C"),
q("C11","single","sorting","LSD radix sort 1st run for {321,156,57,46,28,7,331,33,34,63}:",["331,321,33,63,34,156,46,57,7,28","321,331,33,63,34,156,46,57,7,28","156,28,321,331,33,34,46,57,63,7","57,46,28,7,33,34,63,156,321,331"],"B"),
q("C12","single","disjoint-set","Array {1,-4,1,1,-3,4,4,8,-2}. Union sets containing 6 and 8 by size. Root/value:",["1 and -6","4 and -5","8 and -5","8 and -6"],"B"),
q("C13","single","tree","Complete binary tree: level 9 has 100 leaves. Max total nodes:",["311","823","1847","cannot be determined"],"B"),
q("C14","single","heap","Three DeleteMin on {1,3,2,6,7,5,4,15,14,12,9,10,11,13,8}:",["4,5,6,7,8,9,10,11,12,13,14,15","4,6,5,13,7,10,8,15,14,12,9,11","4,6,5,12,7,10,8,15,14,9,13,11","4,5,6,12,7,10,8,15,14,13,9,11"],"B"),
q("C15","single","graph","Undirected graph with 10 vertices: edges needed to guarantee connected in any case:",["45","37","36","9"],"B"),
q("C16","single","graph","Critical path in an AOE network is:",["shortest circuit","longest circuit","shortest path first-to-last event","longest path first-to-last event"],"D"),
q("C17","single","tree","Quadtree with 4 degree-2, 4 degree-3, 3 degree-4 nodes. Leaves:",["22","21","20","12"],"A"),
q("C18","single","linked-list","Insert s after p in a doubly linked circular list:",["p->next=s; s->prior=p; p->next->prior=s; s->next=p->next;","p->next->prior=s; p->next=s; s->prior=p; s->next=p->next;","s->prior=p; s->next=p->next; p->next=s; p->next->prior=s;","s->prior=p; s->next=p->next; p->next->prior=s; p->next=s;"],"D"),
q("C19","single","graph","Dijkstra from 1; edges 1→2(5),1→5(4),2→3(2),2→4(9),3→5(6),4→1(2),5→2(6),5→4(7),5→6(5),6→3(2). Destination order:",["5,2,3,4,6","5,2,3,6,4","5,2,4,3,6","5,2,6,3,4"],"B"),
q("C20","single","graph","Shortest b→a is 10; edge c-b weight 3. How many are true: c→a must be 13; must be 7; <=13; >=7.",["1","2","3","4"],"B"),
q("C21","single","queue","Circular queue with front and size instead of rear. Max capacity:",["m-1","m","m+1","cannot be determined"],"B"),
q("C22","single","disjoint-set","Array {4,6,5,2,-3,-4,3}, elements 1..7. After Union(Find(7),Find(1)):",["{4,6,5,2,6,-7,3}","{4,6,5,2,-7,5,3}","{6,6,5,6,-7,5,5}","{6,6,5,6,6,-7,5}"],"D"),
q("C23","single","BST","Insert {3,8,9,1,2,6} into BST. Postorder:",["2,1,3,6,9,8","1,2,8,6,9,3","2,1,6,9,8,3","1,2,3,6,9,8"],"C"),
q("C24","single","topological-sort","V={v1..v6}, E={v1v2,v1v4,v2v6,v3v1,v3v4,v4v5,v5v2,v5v6}. Topological order:",["v3,v1,v4,v5,v2,v6","v3,v4,v1,v5,v2,v6","v1,v3,v4,v5,v2,v6","v1,v4,v3,v5,v2,v6"],"A"),
q("C25","single","tree","Complete binary tree with 1102 nodes. Leaves:",["79","551","1063","cannot be determined"],"B"),
q("C26","single","complexity","P1:T(N)=T(N/2)+1; P2:T(N)=2T(N/2)+1. Correct:",["both O(logN)","P1 O(logN), P2 O(N)","both O(N)","P1 O(logN), P2 O(NlogN)"],"B"),
q("C27","single","heap","Three DeleteMin on {1,3,2,12,6,4,8,15,14,9,7,5,11,13,10}:",["4,5,6,7,8,9,10,11,12,13,14,15","4,6,5,13,7,10,8,15,14,12,9,11","4,6,5,12,7,10,8,15,14,9,13,11","4,5,6,12,7,10,8,15,14,13,9,11"],"C"),
q("C28","single","topological-sort","True statement about topological sorting:",["topological sequence => adjacency matrix triangular","triangular matrix => unique topological sequence","DAG with path relation for every pair => unique topological sequence","u before v => path u to v"],"C"),
q("C29","single","tree","Inorder iterative stack sequence push1,push2,push3,pop,push4,pop,pop,push5,pop,pop,push6,pop. True:",["6 is root","2 is parent of 4","2 and 6 are siblings","None"],"C"),
q("C30","single","tree","Quadtree with 2 degree-2, 3 degree-3, 4 degree-4 nodes. Leaves:",["10","12","20","21"],"D"),
q("C31","single","graph","Undirected graph with 7 vertices: edges needed to guarantee connected:",["6","15","16","21"],"C"),
q("C32","single","BST","Insert {5,11,13,1,3,6} into BST. Postorder:",["3,1,5,6,13,11","3,1,6,13,11,5","1,3,11,6,13,5","1,3,5,6,13,11"],"B"),
q("C33","single","tree","Complete binary tree with 2435 nodes. Leaves:",["1218","1217","812","cannot be determined"],"A"),
q("C34","single","sorting","Which sorts slow down with linked instead of sequential storage? 1 insertion,2 selection,3 bubble,4 shell,5 heap.",["1 and 2 only","2 and 3 only","3 and 4 only","4 and 5 only"],"D"),
q("C35","single","threaded-tree","In-order threaded tree: preorder B E A C F D, inorder A E C B D F. Both right links threads:",["B and E","E and F","A and E","A and D"],"D"),
q("C36","single","sorting","Shell sort first run gives (4,2,1,8,3,5,10,6,9,11,7), second gives (1,2,3,5,4,6,7,8,9,11,10). Increments:",["3 and 1","3 and 2","5 and 2","5 and 3"],"B"),
q("C37","single","sorting","LSD 1st run for {4321,56,57,46,28,7,331,33,234,63}:",["331,4321,33,63,234,56,46,57,7,28","4321,331,33,63,234,56,46,57,7,28","56,28,4321,331,33,234,46,57,63,7","57,46,28,7,33,234,63,56,4321,331"],"B"),
q("C38","single","sorting","Quicksort: left pointer stops at equal pivot, right does not. All keys equal runtime:",["O(logN)","O(N)","O(NlogN)","O(N^2)"],"D"),
q("C39","single","sorting","Quicksort: neither pointer stops at equal pivot. All keys equal runtime:",["O(logN)","O(N)","O(NlogN)","O(N^2)"],"D"),
q("C40","single","threaded-tree","Same threaded tree. Both left links threads:",["B and E","E and F","C and F","C and D"],"C"),
q("C41","single","BST","Insert {6,9,12,3,4,8}. Postorder:",["4,3,6,8,12,9","3,4,9,8,12,6","3,4,6,8,12,9","4,3,8,12,9,6"],"D"),
q("C42","single","sorting","LSD 1st run for {4321,56,57,46,289,17,331,33,234,63}:",["4321,331,33,63,234,56,46,57,17,289","331,4321,33,63,234,56,46,57,17,289","56,289,4321,331,33,234,46,57,63,17","57,46,289,17,33,234,63,56,4321,331"],"A"),
q("C43","single","tree","Quadtree with 3 degree-2, 2 degree-3, 4 degree-4 nodes. Leaves:",["10","12","20","21"],"C"),
q("C44","single","linear-list","Sequential list length N: query and insertion complexities:",["O(1),O(1)","O(1),O(N)","O(N),O(1)","O(N),O(N)"],"B"),
q("C45","single","BST","If a BST of N nodes is complete, which is false?",["average search O(logN)","minimum key must be leaf","maximum key must be leaf","median node is root or in left subtree"],"C"),
q("C46","single","complexity","Time complexity: x=0; while(n >= (x+1)^2) x=x+1;",["O(logn)","O(sqrt(n))","O(n)","O(n^2)"],"B"),
q("C47","single","disjoint-set","Array {2,-4,2,2,-3,5,6,9,-2}. Union(Find(7),Find(9)) by size. Changed:",["5 and 7","7 and 9","5 and 9","5,7 and 9"],"D"),
q("C48","single","queue","Printer buffer should use:",["stack","queue","tree","graph"],"B"),
q("C49","single","stack","Popping sequence {a,b,c,d,e}. Impossible pushing sequence:",["c b a e d","d e a c b","e a b c d","e d a b c"],"B"),
q("C50","single","topological-sort","DAG edges a→b,a→e,b→c,b→f,e→f,f→c,c→d,f→d. Number of topological orders:",["2","3","4","5"],"A"),
q("C51","single","graph","If graph is not connected and has 20 edges, it must have at least vertices:",["7","8","9","10"],"B"),
q("C52","single","tree","Full tree of degree 3 with 217 nodes. Leaves:",["71","72","145","146"],"C"),
q("C53","single","graph","AOE: 1→2(3),3→2(4),1→3(8),2→4 d=7,2→5(6),3→5(10),4→6(6),5→6(9). Earliest/latest completion of d:",["3 and 7","12 and 12","12 and 14","15 and 15"],"C"),
q("C54","single","graph","Dijkstra counts shortest paths. count[] initialized as:",["count[S]=1; others 0","count[S]=0; others 1","all 1","all 0"],"A"),
q("C55","single","data-structure","Picture analogy is best represented by:",["Circularly linked list","Directed graph","Two-dimensional array","Complete binary tree"],"A"),
q("C56","single","tree","Given binary tree shape and inorder {e,a,c,b,d,g,f}, node on same level of c:",["a","g","d","None"],"B"),
q("C57","single","stack","Convert ((a+b)-c*(d/e))+f to postfix. Max operators in stack:",["6","4","5","3"],"C"),
q("C58","single","tree","Full tree degree 3 with 31 nodes. Max height, single node height=1:",["10","cannot be determined","11","9"],"A"),
q("C59","single","heap","Min-heap level {2,17,5,46,22,8,10}; build max-heap, DeleteMax. Postorder:",["5,2,17,8,10,22","2,8,10,5,17,22","2,8,17,5,10,22","22,17,5,2,10,8"],"A"),
q("C60","single","queue","Circular queue a[20], front=7, rear=3. Size:",["17","4","5","16"],"D"),
q("C61","single","tree","Complete binary tree with 1238 nodes. Leaves:",["215","214","620","619"],"D"),
q("C62","single","disjoint-set","Array {3,1,-5,2,1,-3,-1,6,6}. After Union(Find(4),Find(8)) with size+compression, changed count:",["4","3","1","2"],"A"),
q("C63","single","BST","BST level {7,4,12,3,6,8,1,5,10}; delete 4. False statement:",["inorder {1,3,5,6,7,8,10,12}","6 and 12 may be same level","3 and 12 may be same level","5 and 12 may be same level"],"B"),
q("C64","single","tree","A and B are both leaves. Which is TRUE?",["pre ...A...B... and post ...B...A... possible","pre ...A...B... and inorder ...B...A... possible","None of the above","inorder ...A...B... and post ...B...A... possible"],"C"),
q("C65","single","disjoint-set","Array {1,-4,1,1,-3,4,4,8,-2}. Union sets containing 6 and 8 by size. Root/value:",["1 and -6","8 and -6","8 and -5","4 and -5"],"D"),
q("C66","single","tree","Full tree degree 4 with 257 nodes. Leaves:",["64","193","63","194"],"B"),
q("C67","single","stack","Push {1..7} onto S; popped items enqueued. Dequeue {4,5,7,6,3,2,1}. Min stack size:",["5","3","4","2"],"A"),
q("C68","single","BST","Insert {28,15,42,18,22,5,40}. Postorder:",["5,22,15,40,18,42,28","5,15,18,22,40,42,28","5,22,18,15,40,42,28","28,22,18,42,40,15,5"],"C"),
q("C69","single","stack","Push {1..N}; pop {p1..pN}; if p1=N, then pi:",["i","n-i","n-i+1","cannot be determined"],"C"),
q("C70","single","BST","BST shape: root two children; left has two children; right has right child. Impossible insertion sequence:",["85 89 95 56 75 18","85 56 89 95 18 75","85 56 75 89 18 95","85 89 75 56 18 95"],"D"),
q("C71","single","tree","Full complete binary tree with k leaves. Total nodes:",["k^2","2k-1","2k","2^k-1"],"B"),
q("C72","single","heap","Build min-heap from {16,28,14,13,7,6}, then DeleteMin. False:",["13 and 14 are siblings","7 is root","28 is left child of 13","13 is parent of 16"],"C"),
q("C73","single","stack-queue","Q has 1..6, S empty; print Q, move Q→S, print S. NOT possible:",["6,5,4,3,2,1","3,4,5,6,1,2","1,2,5,6,4,3","2,3,4,5,6,1"],"B"),
q("C74","single","complexity","Time complexity: x=0; while(n >= (x+1)^2) x=x+1;",["O(n)","O(sqrt(n))","O(n^2)","O(logn)"],"B"),
q("C75","single","stack","Convert a+b*c+(d*e+f)*g. Stack bottom-up when f is read:",["+( ","abcde","++(+","+(*+"],"A"),
q("C76","single","linked-list","Link tail of La with head of Lb in O(1) and min extra space:",["singly linked circular list with tail pointer","singly linked circular list","singly linked list","doubly linked circular list with dummy head"],"A"),
q("C77","single","BST","Insert {6,9,12,3,4,8}. Postorder:",["3,4,9,8,12,6","3,4,6,8,12,9","4,3,8,12,9,6","4,3,6,8,12,9"],"C"),

q("F1","fill","heap","DecreaseKey in min-heap: for(i=____; H->Elements[i/2]>key; i/=2) ____;",2,["P","H->Elements[i] = H->Elements[i/2]"],"降低 key 从 P 开始上滤。"),
q("F2","fill","disjoint-set","Find with compression: for(root=X; S[root]>0; ____); lead=S[trail]; ____;",2,["root = S[root]","S[trail] = root"],"追溯根并把沿途节点挂到根。"),
q("F3","fill","heap","FindKthSmallest max-heap: if(child!=K && ____) child++; if(____) H[i]=H[child];",2,["H[child+1] > H[child]","H[0] > H[child]"],"选择更大孩子。"),
q("F4","fill","sorting","Bidirectional selection: for(j=i+1; ____; ++j) if(____) mini=j; if(____) swap(...);",3,["j <= n - i + 1","r[j]->key < r[mini]->key","maxi == i"],"一轮同时放最小和最大。"),
q("F5","fill","heap","Delete heap element p: upward blank1; choose smaller child blank2; move child if blank3.",3,["H->Elements[p] = H->Elements[p/2]","H->Elements[child+1] < H->Elements[child]","temp > H->Elements[child]"],"删除后 temp 可能上滤或下滤。"),
q("F6","fill","graph","Dijkstra relaxation: if(____){ dist[W]=____; path[W]=____; }",3,["dist[V] + Graph->G[V][W] < dist[W]","dist[V] + Graph->G[V][W]","V"],"经过 V 更短则更新。"),
q("F7","fill","linked-list","Reverse list: Temp=Old_head->Next; ____; New_head=Old_head; Old_head=Temp; ... ____;",2,["Old_head->Next = New_head","L->Next = New_head"],"头插法反转。")
];

function norm(v){return String(v??"").replace(/\s+/g," ").replace(/[；;。.]$/g,"").trim().toLowerCase()}
function ok(x,sel,fill={}){return !x?false:x.type==="fill"?x.answer.every((a,i)=>norm(fill[i])===norm(a)):sel===x.answer}
function filt(arr,{mode="all",onlyWrong=false,keyword="",wrongIds=[]}={}){const k=keyword.trim().toLowerCase(), ws=new Set(wrongIds);return arr.filter(x=>(mode==="all"||x.type===mode)&&(!onlyWrong||ws.has(x.id))&&(!k||`${x.id} ${x.type} ${x.topic} ${x.prompt}`.toLowerCase().includes(k)))}
function updWrong(prev,id,correct){const s=new Set(prev);correct?s.delete(id):s.add(id);return [...s]}
function topicStats(hist){const m={};Object.entries(hist||{}).forEach(([id,r])=>{const x=Q.find(q=>q.id===id);if(!x)return;m[x.topic]??={done:0,wrong:0};m[x.topic].done+=r.done||0;m[x.topic].wrong+=r.wrong||0});return Object.entries(m).sort((a,b)=>b[1].wrong-a[1].wrong).slice(0,8)}
function tests(){const t=[];const a=(n,p)=>t.push({n,p:!!p});a("114 questions",Q.length===114);a("unique ids",new Set(Q.map(x=>x.id)).size===Q.length);a("single options",Q.filter(x=>x.type==="single").every(x=>x.options?.length>=4));a("fill answer count",Q.filter(x=>x.type==="fill").every(x=>x.answer.length===x.options));a("single ok",ok(Q.find(x=>x.id==="C1"),"C"));a("tf ok",ok(Q.find(x=>x.id==="T20"),"F"));a("fill ok",ok(Q.find(x=>x.id==="F1"),"",{0:"p",1:"H->Elements[i] = H->Elements[i/2];"}));return t}
const TESTS=tests();
function useLS(k,init){const [v,setV]=useState(()=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):init}catch{return init}});useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},[k,v]);return [v,setV]}

export default function App(){
 const [mode,setMode]=useState("all"),[onlyWrong,setOnlyWrong]=useState(false),[keyword,setKeyword]=useState(""),[idx,setIdx]=useState(0),[sel,setSel]=useState(""),[fill,setFill]=useState({}),[checked,setChecked]=useState(false);
 const [wrong,setWrong]=useLS("ds_wrong_v4",[]),[stats,setStats]=useLS("ds_stats_v4",{done:0,right:0,wrong:0,history:{}}),[saved,setSaved]=useLS("ds_progress_v1",null);
 const list=useMemo(()=>filt(Q,{mode,onlyWrong,keyword,wrongIds:wrong}),[mode,onlyWrong,keyword,wrong]);
 const total=list.length, i=total?Math.min(idx,total-1):0, x=list[i], correct=ok(x,sel,fill), acc=stats.done?Math.round(stats.right/stats.done*100):0, bad=TESTS.filter(t=>!t.p), weak=topicStats(stats.history), wrongSet=new Set(wrong);
 useEffect(()=>{setIdx(0);resetInput()},[mode,onlyWrong,keyword]);
 useEffect(()=>{setSaved({mode,onlyWrong,keyword,idx,sel,fill,checked,wrong,stats,t:Date.now()})},[mode,onlyWrong,keyword,idx,sel,fill,checked,wrong,stats]);
 function resetInput(){setSel("");setFill({});setChecked(false)}
 function submit(){if(!x||checked)return;setChecked(true);setStats(p=>{const h=p.history||{}, old=h[x.id]||{done:0,right:0,wrong:0};return{done:p.done+1,right:p.right+(correct?1:0),wrong:p.wrong+(correct?0:1),history:{...h,[x.id]:{done:old.done+1,right:old.right+(correct?1:0),wrong:old.wrong+(correct?0:1),last:correct?"right":"wrong"}}}});setWrong(p=>updWrong(p,x.id,correct))}
 function go(n){if(!total)return;setIdx(v=>(v+n+total)%total);resetInput()}
 function random(){if(!total)return;setIdx(Math.floor(Math.random()*total));resetInput()}
 function exportData(){const blob=new Blob([JSON.stringify({wrong,stats,saved},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="ds-quiz-progress.json";a.click();URL.revokeObjectURL(url)}
 function saveNow(){setSaved({mode,onlyWrong,keyword,idx,sel,fill,checked,wrong,stats,t:Date.now()});alert("进度已保存到本机浏览器")}
 function loadSaved(){if(!saved)return alert("暂无已保存进度");setMode(saved.mode??"all");setOnlyWrong(!!saved.onlyWrong);setKeyword(saved.keyword??"");setSel(saved.sel??"");setFill(saved.fill??{});setChecked(!!saved.checked);setWrong(saved.wrong??[]);setStats(saved.stats??{done:0,right:0,wrong:0,history:{}});setTimeout(()=>setIdx(saved.idx??0),0)}
 function clearSaved(){setSaved(null);alert("已清除保存的进度")}
 function fmt(t){return t?new Date(t).toLocaleString():"暂无"}
 return <div style={S.page}><div style={S.wrap}>
  <header style={S.head}><div><div style={S.muted}>📘 数据结构基础期中题库刷题站</div><h1 style={S.h1}>刷题、判分、自动整理错题</h1><p style={S.muted}>压缩单文件版，题库 114 题，做题位置、当前选择、错题和统计都会保存在浏览器本地。</p></div><div style={S.stats}><Box k="已做" v={stats.done}/><Box k="正确率" v={acc+"%"}/><Box k="错题" v={wrong.length}/></div></header>
  <section style={S.toolbar}><div style={S.tabs}>{Object.entries(L).map(([k,v])=><button key={k} style={{...S.tab,...(mode===k?S.active:{})}} onClick={()=>setMode(k)}>{v}</button>)}</div><div style={S.controls}><input style={S.input} placeholder="搜索题号、专题或题干" value={keyword} onChange={e=>setKeyword(e.target.value)}/><label><input type="checkbox" checked={onlyWrong} onChange={e=>setOnlyWrong(e.target.checked)}/> 只看错题</label><button style={S.btn2} onClick={random}>随机</button></div></section>
  <main style={S.layout}><section style={S.card}>{!x?<div style={S.empty}>没有符合条件的题目。</div>:<Quiz x={x} i={i} total={total} sel={sel} setSel={setSel} fill={fill} setFill={setFill} checked={checked} correct={correct} wrongSet={wrongSet} submit={submit} go={go} toggle={()=>setWrong(p=>p.includes(x.id)?p.filter(id=>id!==x.id):[...p,x.id])}/>}</section>
  <aside style={S.side}><Panel title="薄弱专题">{weak.length?weak.map(([k,v])=><div key={k} style={S.row}><span>{k}</span><span style={S.muted}>错 {v.wrong} / 做 {v.done}</span></div>):<p style={S.muted}>做题后显示错题高频专题。</p>}</Panel><Panel title="题库概况"><div style={S.grid}><Box k="判断题" v={30}/><Box k="单选题" v={77}/><Box k="程序填空" v={7}/><Box k="当前筛选" v={total}/></div><div style={S.actions}><button style={S.btn2} onClick={exportData}>导出</button><button style={S.btn2} onClick={()=>{setWrong([]);setStats({done:0,right:0,wrong:0,history:{}});resetInput()}}>重置</button><button style={S.link} onClick={()=>setWrong([])}>清空错题</button></div></Panel><Panel title="保存进度"><p style={S.muted}>最近保存：{fmt(saved?.t)}</p><div style={S.actions}><button style={S.btn2} onClick={saveNow}>保存当前进度</button><button style={S.btn2} onClick={loadSaved}>读取进度</button><button style={S.link} onClick={clearSaved}>清除存档</button></div></Panel><Panel title="自测状态"><p style={bad.length?S.err:S.muted}>{bad.length?`${bad.length} 项测试未通过`:`已通过 ${TESTS.length} 项核心测试`}</p></Panel></aside></main>
 </div></div>
}
function Quiz({x,i,total,sel,setSel,fill,setFill,checked,correct,wrongSet,submit,go,toggle}){const need=x.type!=="fill"&&!sel;return <div style={S.quiz}><div style={S.meta}><div><b style={S.badge}>{x.id}</b> <b style={S.dark}>{L[x.type]}</b> <b style={S.badge}>{x.topic}</b> {wrongSet.has(x.id)&&<b style={S.red}>★ 错题</b>}</div><span style={S.muted}>{i+1}/{total}</span></div><h2 style={S.q}>{x.prompt}</h2>{x.type==="tf"&&<Choices opts={["T","F"]} sel={sel} setSel={setSel} checked={checked} ans={x.answer}/>} {x.type==="single"&&<Choices opts={x.options} sel={sel} setSel={setSel} checked={checked} ans={x.answer} letters/>} {x.type==="fill"&&Array.from({length:x.options}).map((_,j)=><input key={j} style={S.inputFull} placeholder={`第 ${j+1} 空`} disabled={checked} value={fill[j]||""} onChange={e=>setFill({...fill,[j]:e.target.value})}/>) }<div style={S.actions}><button style={S.btn} disabled={checked||need} onClick={submit}>提交答案</button><button style={S.btn2} onClick={()=>go(-1)}>上一题</button><button style={S.btn2} onClick={()=>go(1)}>下一题</button><button style={S.link} onClick={toggle}>{wrongSet.has(x.id)?"移出错题":"加入错题"}</button></div>{checked&&<div style={{...S.result,...(correct?S.good:S.bad)}}><b>{correct?"✓ 回答正确":"✕ 回答错误"}</b><p>正确答案：<Ans x={x}/></p>{x.tip&&<p>提示：{x.tip}</p>}</div>}</div>}
function Choices({opts,sel,setSel,checked,ans,letters=false}){return <div style={S.choices}>{opts.map((o,j)=>{const k=letters?ABC[j]:o;return <button key={k} disabled={checked} onClick={()=>setSel(k)} style={{...S.choice,...(sel===k?S.chosen:{}),...(checked&&k===ans?S.good:{}),...(checked&&sel===k&&k!==ans?S.bad:{})}}><b>{letters?`${k}.`:k}</b><span>{o}</span></button>})}</div>}
function Ans({x}){if(x.type==="fill")return <code>{x.answer.map((a,i)=>`${i+1}. ${a}`).join("； ")}</code>;if(x.type==="single")return <code>{x.answer}. {x.options[ABC.indexOf(x.answer)]}</code>;return <code>{x.answer}</code>}
function Box({k,v}){return <div style={S.box}><small>{k}</small><b>{v}</b></div>}
function Panel({title,children}){return <section style={S.panel}><h3>{title}</h3>{children}</section>}
const S={page:{minHeight:"100vh",background:"#f8fafc",color:"#0f172a",fontFamily:"system-ui,-apple-system,Segoe UI,sans-serif",padding:24},wrap:{maxWidth:1180,margin:"0 auto"},head:{display:"flex",justifyContent:"space-between",gap:20,flexWrap:"wrap",alignItems:"end",marginBottom:20},h1:{fontSize:40,margin:"6px 0"},muted:{color:"#64748b",lineHeight:1.6},stats:{display:"grid",gridTemplateColumns:"repeat(3,90px)",gap:10},box:{background:"white",border:"1px solid #e2e8f0",borderRadius:16,padding:12,textAlign:"center",display:"grid",gap:4},toolbar:{background:"white",border:"1px solid #e2e8f0",borderRadius:18,padding:14,display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:20},tabs:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,minWidth:340},tab:{border:0,borderRadius:10,padding:"10px 12px",background:"#f1f5f9",fontWeight:700,cursor:"pointer"},active:{background:"#0f172a",color:"white"},controls:{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"},input:{height:38,border:"1px solid #cbd5e1",borderRadius:10,padding:"0 10px",minWidth:230},layout:{display:"grid",gridTemplateColumns:"1fr 310px",gap:20},card:{background:"white",border:"1px solid #e2e8f0",borderRadius:20,padding:24,minHeight:520},side:{display:"flex",flexDirection:"column",gap:12},panel:{background:"white",border:"1px solid #e2e8f0",borderRadius:18,padding:16},grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},row:{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #f1f5f9",padding:"8px 0"},empty:{padding:90,textAlign:"center",color:"#64748b"},quiz:{display:"flex",flexDirection:"column",gap:18},meta:{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"},badge:{border:"1px solid #cbd5e1",borderRadius:999,padding:"4px 8px",fontSize:12},dark:{background:"#0f172a",color:"white",borderRadius:999,padding:"4px 8px",fontSize:12},red:{background:"#dc2626",color:"white",borderRadius:999,padding:"4px 8px",fontSize:12},q:{fontSize:23,lineHeight:1.55,margin:0},choices:{display:"grid",gap:10},choice:{width:"100%",textAlign:"left",border:"1px solid #e2e8f0",borderRadius:14,background:"white",padding:14,cursor:"pointer",display:"flex",gap:12},chosen:{borderColor:"#0f172a",boxShadow:"0 0 0 3px rgba(15,23,42,.08)"},good:{background:"#ecfdf5",borderColor:"#10b981"},bad:{background:"#fef2f2",borderColor:"#ef4444"},inputFull:{border:"1px solid #cbd5e1",borderRadius:10,padding:12,fontFamily:"monospace"},actions:{display:"flex",gap:10,flexWrap:"wrap"},btn:{border:0,borderRadius:10,padding:"10px 14px",background:"#0f172a",color:"white",fontWeight:700,cursor:"pointer"},btn2:{border:"1px solid #cbd5e1",borderRadius:10,padding:"10px 14px",background:"white",fontWeight:700,cursor:"pointer"},link:{border:0,background:"transparent",padding:"10px 14px",fontWeight:700,cursor:"pointer"},result:{border:"1px solid",borderRadius:16,padding:14},err:{color:"#b91c1c"}};
