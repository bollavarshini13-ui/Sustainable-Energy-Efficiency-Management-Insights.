
import java.util.*;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 *  ECOTRACK — Energy Saving Dashboard (Java DSA Implementation)
 *  Covers: CO1 → CO6 (Algorithms, ADTs, Stacks, Queues,
 *          Heaps, HashTables, Collections, Applications)
 * ╚══════════════════════════════════════════════════════════════╝
 */
public class EcoTrack {

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 1 — DATA MODEL (Tip, Category)
    // ─────────────────────────────────────────────────────────────
    enum Impact { HIGH(3), MED(2), LOW(1);
        final int score;
        Impact(int s){ this.score = s; }
    }

    static class Tip {
        String id, text, category;
        Impact impact;
        double co2;
        boolean done;

        Tip(String id, String text, String category, Impact impact, double co2){
            this.id = id; this.text = text; this.category = category;
            this.impact = impact; this.co2 = co2; this.done = false;
        }

        @Override public String toString(){
            return String.format("[%s] %-45s | Impact:%-4s | CO2:%.1fkg %s",
                id, text, impact, co2, done ? "✔" : " ");
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 2 — LINKED LIST (CO2)
    //   Singly Linked List to store eco tips in a category
    // ─────────────────────    ────────────────────────────────────────
    static class Node<T> {
        T data; Node<T> next;
        Node(T d){ data = d; }
    }

    static class SinglyLinkedList<T> {
        Node<T> head; int size;

        void insertFront(T d){ Node<T> n = new Node<>(d); n.next = head; head = n; size++; }
        void insertBack(T d){
            Node<T> n = new Node<>(d);
            if(head == null){ head = n; size++; return; }
            Node<T> cur = head; while(cur.next != null) cur = cur.next;
            cur.next = n; size++;
        }
        boolean delete(String id){ // for Tip nodes
            if(head == null) return false;
            if(((Tip)head.data).id.equals(id)){ head = head.next; size--; return true; }
            Node<T> cur = head;
            while(cur.next != null){
                if(((Tip)cur.next.data).id.equals(id)){ cur.next = cur.next.next; size--; return true; }
                cur = cur.next;
            }
            return false;
        }
        void traverse(){
            Node<T> cur = head;
            while(cur != null){ System.out.println("  " + cur.data); cur = cur.next; }
        }
        // Reverse the list in-place O(n)
        void reverse(){
            Node<T> prev = null, cur = head, next;
            while(cur != null){ next = cur.next; cur.next = prev; prev = cur; cur = next; }
            head = prev;
        }
        // Detect cycle (Floyd's Algorithm) O(n)
        boolean hasCycle(){
            Node<T> slow = head, fast = head;
            while(fast != null && fast.next != null){
                slow = slow.next; fast = fast.next.next;
                if(slow == fast) return true;
            }
            return false;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 3 — STACK (CO3) — Undo/Redo for tip actions
    // ─────────────────────────────────────────────────────────────
    static class Stack<T> {
        private final Deque<T> deque = new ArrayDeque<>();
        void push(T item){ deque.push(item); }
        T pop(){ return deque.isEmpty() ? null : deque.pop(); }
        T peek(){ return deque.isEmpty() ? null : deque.peek(); }
        boolean isEmpty(){ return deque.isEmpty(); }
        int size(){ return deque.size(); }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 4 — CIRCULAR QUEUE (CO3) — Notification ring buffer
    // ─────────────────────────────────────────────────────────────
    static class CircularQueue {
        private final String[] arr;
        private int front, rear, count;
        CircularQueue(int cap){ arr = new String[cap]; front = rear = count = 0; }
        boolean enqueue(String msg){
            if(count == arr.length) return false; // full
            arr[rear] = msg; rear = (rear+1) % arr.length; count++;
            return true;
        }
        String dequeue(){
            if(count == 0) return null;
            String msg = arr[front]; front = (front+1) % arr.length; count--; return msg;
        }
        int size(){ return count; }
        void printAll(){
            int i = front;
            for(int k=0; k<count; k++){ System.out.println("  [NOTIF] " + arr[i]); i=(i+1)%arr.length; }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 5 — MAX-HEAP / PRIORITY QUEUE (CO3)
    //   Tips prioritized by CO2 impact
    // ─────────────────────────────────────────────────────────────
    static class MaxHeap {
        private final List<Tip> heap = new ArrayList<>();

        private int parent(int i){ return (i-1)/2; }
        private int left(int i){ return 2*i+1; }
        private int right(int i){ return 2*i+2; }
        private void swap(int a, int b){ Tip t=heap.get(a); heap.set(a,heap.get(b)); heap.set(b,t); }

        void insert(Tip tip){
            heap.add(tip);
            int i = heap.size()-1;
            while(i>0 && heap.get(parent(i)).co2 < heap.get(i).co2){
                swap(i, parent(i)); i = parent(i);
            }
        }
        Tip extractMax(){
            if(heap.isEmpty()) return null;
            Tip max = heap.get(0);
            heap.set(0, heap.get(heap.size()-1));
            heap.remove(heap.size()-1);
            heapifyDown(0);
            return max;
        }
        private void heapifyDown(int i){
            int largest = i, l = left(i), r = right(i), n = heap.size();
            if(l<n && heap.get(l).co2 > heap.get(largest).co2) largest=l;
            if(r<n && heap.get(r).co2 > heap.get(largest).co2) largest=r;
            if(largest != i){ swap(i, largest); heapifyDown(largest); }
        }
        boolean isEmpty(){ return heap.isEmpty(); }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 6 — HASH TABLE with CHAINING (CO4)
    //   Stores tips for O(1) average lookup by ID
    // ─────────────────────────────────────────────────────────────
    static class HashTable {
        private static final int CAPACITY = 16;
        private final LinkedList<Tip>[] buckets;

        @SuppressWarnings("unchecked")
        HashTable(){ buckets = new LinkedList[CAPACITY]; }

        private int hash(String key){ return Math.abs(key.hashCode()) % CAPACITY; }

        void put(Tip tip){
            int idx = hash(tip.id);
            if(buckets[idx] == null) buckets[idx] = new LinkedList<>();
            // update if exists
            for(Tip t : buckets[idx]) if(t.id.equals(tip.id)){ t.done = tip.done; return; }
            buckets[idx].add(tip);
        }
        Tip get(String id){
            int idx = hash(id);
            if(buckets[idx] == null) return null;
            for(Tip t : buckets[idx]) if(t.id.equals(id)) return t;
            return null;
        }
        boolean markDone(String id){
            Tip t = get(id);
            if(t == null) return false;
            t.done = !t.done; return true;
        }
        void printStats(){
            int filled=0; int maxChain=0;
            for(LinkedList<Tip> b : buckets) if(b!=null){ filled++; maxChain=Math.max(maxChain,b.size()); }
            System.out.printf("  Hash Table: %d/%d buckets used, max chain=%d%n",filled,CAPACITY,maxChain);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 7 — SORTING ALGORITHMS (CO1)
    //   Applied to tip list: bubble, selection, insertion, merge, quick
    // ─────────────────────────────────────────────────────────────
    static class Sorter {
        // Bubble Sort O(n²)
        static void bubbleSort(Tip[] arr, Comparator<Tip> cmp){
            int n = arr.length;
            for(int i=0;i<n-1;i++)
                for(int j=0;j<n-i-1;j++)
                    if(cmp.compare(arr[j],arr[j+1])>0){ Tip t=arr[j]; arr[j]=arr[j+1]; arr[j+1]=t; }
        }
        // Selection Sort O(n²)
        static void selectionSort(Tip[] arr, Comparator<Tip> cmp){
            int n=arr.length;
            for(int i=0;i<n-1;i++){
                int min=i;
                for(int j=i+1;j<n;j++) if(cmp.compare(arr[j],arr[min])<0) min=j;
                Tip t=arr[i]; arr[i]=arr[min]; arr[min]=t;
            }
        }
        // Insertion Sort O(n²)
        static void insertionSort(Tip[] arr, Comparator<Tip> cmp){
            for(int i=1;i<arr.length;i++){
                Tip key=arr[i]; int j=i-1;
                while(j>=0 && cmp.compare(arr[j],key)>0){ arr[j+1]=arr[j]; j--; }
                arr[j+1]=key;
            }
        }
        // Merge Sort O(n log n)
        static void mergeSort(Tip[] arr, int l, int r, Comparator<Tip> cmp){
            if(l>=r) return;
            int m=(l+r)/2;
            mergeSort(arr,l,m,cmp); mergeSort(arr,m+1,r,cmp);
            merge(arr,l,m,r,cmp);
        }
        private static void merge(Tip[] arr, int l, int m, int r, Comparator<Tip> cmp){
            Tip[] L=Arrays.copyOfRange(arr,l,m+1), R=Arrays.copyOfRange(arr,m+1,r+1);
            int i=0,j=0,k=l;
            while(i<L.length && j<R.length) arr[k++]=(cmp.compare(L[i],R[j])<=0)?L[i++]:R[j++];
            while(i<L.length) arr[k++]=L[i++];
            while(j<R.length) arr[k++]=R[j++];
        }
        // Quick Sort O(n log n) avg
        static void quickSort(Tip[] arr, int l, int r, Comparator<Tip> cmp){
            if(l>=r) return;
            int p=partition(arr,l,r,cmp);
            quickSort(arr,l,p-1,cmp); quickSort(arr,p+1,r,cmp);
        }
        private static int partition(Tip[] arr, int l, int r, Comparator<Tip> cmp){
            Tip pivot=arr[r]; int i=l-1;
            for(int j=l;j<r;j++) if(cmp.compare(arr[j],pivot)<=0){ i++; Tip t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
            Tip t=arr[i+1]; arr[i+1]=arr[r]; arr[r]=t;
            return i+1;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 8 — SEARCH ALGORITHMS (CO1)
    //   Linear search (any) + Binary search (sorted by id lexically)
    // ─────────────────────────────────────────────────────────────
    static class Searcher {
        // Linear Search O(n) — search by partial text
        static List<Tip> linearSearch(Tip[] tips, String query){
            List<Tip> results = new ArrayList<>();
            query = query.toLowerCase();
            for(Tip t : tips) if(t.text.toLowerCase().contains(query)) results.add(t);
            return results;
        }
        // Binary Search O(log n) — search by exact ID in sorted array
        static Tip binarySearch(Tip[] sorted, String id){
            int lo=0, hi=sorted.length-1;
            while(lo<=hi){
                int mid=(lo+hi)/2;
                int cmp=sorted[mid].id.compareTo(id);
                if(cmp==0) return sorted[mid];
                else if(cmp<0) lo=mid+1; else hi=mid-1;
            }
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 9 — DOUBLY LINKED LIST (CO2)
    //   For browsing tips forward and backward (history navigation)
    // ─────────────────────────────────────────────────────────────
    static class DoublyLinkedList {
        static class DNode { Tip data; DNode prev, next; DNode(Tip d){ data=d; } }
        DNode head, tail; int size;

        void addBack(Tip t){
            DNode n = new DNode(t);
            if(tail==null){ head=tail=n; } else { tail.next=n; n.prev=tail; tail=n; }
            size++;
        }
        void traverse(boolean forward){
            DNode cur = forward ? head : tail;
            System.out.println("  Direction: " + (forward ? "→ Forward" : "← Backward"));
            while(cur!=null){
                System.out.println("  " + cur.data);
                cur = forward ? cur.next : cur.prev;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ SECTION 10 — JAVA COLLECTIONS USAGE (CO4)
    //   Dashboard uses Map, List, Deque, PriorityQueue
    // ─────────────────────────────────────────────────────────────
    static class Dashboard {
        Map<String, List<Tip>> categoryMap = new LinkedHashMap<>();
        PriorityQueue<Tip> highImpactQueue = new PriorityQueue<>((a,b)->Double.compare(b.co2,a.co2));
        Set<String> completedIds = new LinkedHashSet<>();
        int streakDays = 0;

        void addTip(Tip tip){
            categoryMap.computeIfAbsent(tip.category, k->new ArrayList<>()).add(tip);
            highImpactQueue.offer(tip);
        }
        void markDone(String id){
            for(List<Tip> tips : categoryMap.values())
                for(Tip t : tips) if(t.id.equals(id) && !t.done){ t.done=true; completedIds.add(id); streakDays++; }
        }
        double totalCO2Saved(){
            return completedIds.stream()
                .flatMap(id->categoryMap.values().stream().flatMap(List::stream).filter(t->t.id.equals(id)))
                .mapToDouble(t->t.co2).sum();
        }
        int impactScore(){
            return completedIds.stream()
                .flatMap(id->categoryMap.values().stream().flatMap(List::stream).filter(t->t.id.equals(id)))
                .mapToInt(t->t.impact.score).sum();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ◆ MAIN — Demonstrate Everything (CO5, CO6)
    // ─────────────────────────────────────────────────────────────
    public static void main(String[] args){
        banner("ECOTRACK — Energy Saving Dashboard (Java DSA Demo)");

        // ── Seed Tips ──────────────────────────────────────────
        Tip[] allTips = {
            new Tip("l1","Switch to LED bulbs",          "Lighting",    Impact.HIGH, 0.3),
            new Tip("l2","Turn off unused lights",        "Lighting",    Impact.MED,  0.1),
            new Tip("l3","Use natural daylight",          "Lighting",    Impact.LOW,  0.05),
            new Tip("a1","Unplug idle devices",           "Appliances",  Impact.HIGH, 0.4),
            new Tip("a2","Use energy-efficient settings", "Appliances",  Impact.MED,  0.2),
            new Tip("a3","Fix refrigerator door seals",   "Appliances",  Impact.LOW,  0.15),
            new Tip("t1","Walk for short trips",          "Transport",   Impact.HIGH, 0.8),
            new Tip("t2","Carpool to work",               "Transport",   Impact.HIGH, 0.6),
            new Tip("t3","Use public transit",            "Transport",   Impact.MED,  0.5),
        };

        // ─────────────────────────────────────────────────────
        // 1. HASH TABLE — Fast ID lookup (CO4)
        // ─────────────────────────────────────────────────────
        section("1. HASH TABLE (CO4) — O(1) Average Lookup by Tip ID");
        HashTable hashTable = new HashTable();
        for(Tip t : allTips) hashTable.put(t);
        hashTable.printStats();
        String lookupId = "t2";
        Tip found = hashTable.get(lookupId);
        System.out.println("  get(\""+lookupId+"\"): " + (found!=null ? found : "Not found"));
        hashTable.markDone("t1");
        hashTable.markDone("l1");
        System.out.println("  Marked done: t1, l1");

        // ─────────────────────────────────────────────────────
        // 2. SINGLY LINKED LIST — Category storage (CO2)
        // ─────────────────────────────────────────────────────
        section("2. SINGLY LINKED LIST (CO2) — Lighting Category");
        SinglyLinkedList<Tip> lightingList = new SinglyLinkedList<>();
        for(Tip t : allTips) if(t.category.equals("Lighting")) lightingList.insertBack(t);
        System.out.println("  Forward traversal:");
        lightingList.traverse();
        System.out.println("  Reversed:");
        lightingList.reverse();
        lightingList.traverse();
        System.out.println("  Has cycle: " + lightingList.hasCycle());
        lightingList.delete("l3");
        System.out.println("  After deleting l3:");
        lightingList.traverse();

        // ─────────────────────────────────────────────────────
        // 3. DOUBLY LINKED LIST — Browse history (CO2)
        // ─────────────────────────────────────────────────────
        section("3. DOUBLY LINKED LIST (CO2) — Tip Browse History");
        DoublyLinkedList history = new DoublyLinkedList();
        for(Tip t : allTips) history.addBack(t);
        history.traverse(true);
        history.traverse(false);

        // ─────────────────────────────────────────────────────
        // 4. STACK — Undo/Redo (CO3)
        // ─────────────────────────────────────────────────────
        section("4. STACK (CO3) — Undo/Redo Tip Actions");
        Stack<String> undoStack = new Stack<>();
        Stack<String> redoStack = new Stack<>();
        String[] actions = {"Mark l1 done","Mark a1 done","Mark t1 done"};
        for(String a : actions){ undoStack.push(a); System.out.println("  DO: " + a); }
        System.out.println("  Undo: " + undoStack.pop());
        System.out.println("  Undo: " + undoStack.pop());
        redoStack.push("Mark a1 done"); redoStack.push("Mark t1 done");
        System.out.println("  Redo: " + redoStack.pop());
        System.out.println("  Undo stack size: " + undoStack.size());

        // ─────────────────────────────────────────────────────
        // 5. CIRCULAR QUEUE — Notifications (CO3)
        // ─────────────────────────────────────────────────────
        section("5. CIRCULAR QUEUE (CO3) — Notification Ring Buffer (cap=4)");
        CircularQueue notifs = new CircularQueue(4);
        notifs.enqueue("You saved 0.8kg CO2 today!");
        notifs.enqueue("3-day streak! Keep going!");
        notifs.enqueue("New tip: Use smart power strips");
        notifs.enqueue("Appliance check reminder");
        notifs.printAll();
        System.out.println("  Dequeue: " + notifs.dequeue());
        notifs.enqueue("Cycle to work tomorrow?");
        System.out.println("  After dequeue+enqueue:");
        notifs.printAll();

        // ─────────────────────────────────────────────────────
        // 6. MAX-HEAP — Top Impact Tips (CO3)
        // ─────────────────────────────────────────────────────
        section("6. MAX-HEAP (CO3) — Extract Tips by Highest CO2 Impact");
        MaxHeap heap = new MaxHeap();
        for(Tip t : allTips) heap.insert(t);
        System.out.println("  Priority order (highest CO2 first):");
        while(!heap.isEmpty()){
            Tip t = heap.extractMax();
            System.out.printf("    %-45s CO2:%.2fkg%n", t.text, t.co2);
        }

        // ─────────────────────────────────────────────────────
        // 7. SORTING (CO1)
        // ─────────────────────────────────────────────────────
        section("7. SORTING ALGORITHMS (CO1) — All 5 Sorts on CO2 Field");
        Comparator<Tip> byCO2 = Comparator.comparingDouble(t->t.co2);

        Tip[] arr1 = allTips.clone(); long t0 = System.nanoTime();
        Sorter.bubbleSort(arr1, byCO2); long t1=System.nanoTime();
        System.out.printf("  Bubble Sort   O(n^2)      -> [%s] (%dµs)%n", summarize(arr1), (t1-t0)/1000);

        Tip[] arr2 = allTips.clone(); t0=System.nanoTime();
        Sorter.selectionSort(arr2, byCO2); t1=System.nanoTime();
        System.out.printf("  Selection Sort O(n^2)     -> [%s] (%dµs)%n", summarize(arr2), (t1-t0)/1000);

        Tip[] arr3 = allTips.clone(); t0=System.nanoTime();
        Sorter.insertionSort(arr3, byCO2); t1=System.nanoTime();
        System.out.printf("  Insertion Sort O(n^2)     -> [%s] (%dµs)%n", summarize(arr3), (t1-t0)/1000);

        Tip[] arr4 = allTips.clone(); t0=System.nanoTime();
        Sorter.mergeSort(arr4, 0, arr4.length-1, byCO2); t1=System.nanoTime();
        System.out.printf("  Merge Sort    O(n log n)  -> [%s] (%dµs)%n", summarize(arr4), (t1-t0)/1000);

        Tip[] arr5 = allTips.clone(); t0=System.nanoTime();
        Sorter.quickSort(arr5, 0, arr5.length-1, byCO2); t1=System.nanoTime();
        System.out.printf("  Quick Sort    O(n log n)  -> [%s] (%dµs)%n", summarize(arr5), (t1-t0)/1000);

        // ─────────────────────────────────────────────────────
        // 8. SEARCH (CO1)
        // ─────────────────────────────────────────────────────
        section("8. SEARCH ALGORITHMS (CO1)");
        String query = "trip";
        List<Tip> linResults = Searcher.linearSearch(allTips, query);
        System.out.println("  Linear Search O(n) for \"" + query + "\":");
        linResults.forEach(t->System.out.println("    "+t));

        // sort by id for binary search
        Tip[] sortedById = allTips.clone();
        Arrays.sort(sortedById, Comparator.comparing(t->t.id));
        String binId = "t3";
        Tip binResult = Searcher.binarySearch(sortedById, binId);
        System.out.println("  Binary Search O(log n) for id=\""+binId+"\": " + (binResult!=null?binResult:"Not found"));

        // ─────────────────────────────────────────────────────
        // 9. JAVA COLLECTIONS DASHBOARD (CO4, CO5, CO6)
        // ─────────────────────────────────────────────────────
        section("9. FULL DASHBOARD (CO4/CO5/CO6) — Java Collections");
        Dashboard dash = new Dashboard();
        for(Tip t : allTips) dash.addTip(t);

        // Mark some tips done
        String[] toMark = {"t1","t2","l1","a1"};
        for(String id : toMark) dash.markDone(id);

        System.out.println("  === EcoTrack Status ===");
        System.out.printf("  Completed Tips : %d / %d%n", dash.completedIds.size(), allTips.length);
        System.out.printf("  Progress       : %.0f%%%n", dash.completedIds.size()*100.0/allTips.length);
        System.out.printf("  CO2 Saved      : %.2f kg%n", dash.totalCO2Saved());
        System.out.printf("  Impact Score   : %d pts%n", dash.impactScore());
        System.out.printf("  Streak Days    : %d%n", dash.streakDays);

        System.out.println("\n  === Tips by Category ===");
        dash.categoryMap.forEach((cat, tips)->{
            long done = tips.stream().filter(t->t.done).count();
            System.out.printf("  %-12s [%d/%d] completed%n", cat, done, tips.size());
        });

        System.out.println("\n  === Top Impact (PriorityQueue) ===");
        PriorityQueue<Tip> tempQ = new PriorityQueue<>(dash.highImpactQueue);
        int rank=1; while(!tempQ.isEmpty() && rank<=3){
            Tip t = tempQ.poll();
            System.out.printf("  #%d %-45s CO2:%.1fkg%n",rank++,t.text,t.co2);
        }

        // ─────────────────────────────────────────────────────
        // 10. COMPLEXITY SUMMARY (CO1)
        // ─────────────────────────────────────────────────────
        section("10. ASYMPTOTIC COMPLEXITY SUMMARY (CO1)");
        String[][] rows = {
            {"Structure/Algorithm","Operation","Best","Average","Worst","Space"},
            {"─────────────────","─────────","────","───────","─────","─────"},
            {"Singly Linked List","Insert Front","O(1)","O(1)","O(1)","O(n)"},
            {"Singly Linked List","Search","O(1)","O(n)","O(n)","O(n)"},
            {"Hash Table (Chain)","Get/Put","O(1)","O(1)","O(n)","O(n)"},
            {"Stack (ArrayDeque)","Push/Pop","O(1)","O(1)","O(1)","O(n)"},
            {"Circular Queue","Enq/Deq","O(1)","O(1)","O(1)","O(n)"},
            {"Max-Heap","Insert","O(1)","O(log n)","O(log n)","O(n)"},
            {"Max-Heap","Extract Max","O(log n)","O(log n)","O(log n)","O(n)"},
            {"Bubble Sort","Sort","O(n)","O(n^2)","O(n^2)","O(1)"},
            {"Merge Sort","Sort","O(n log n)","O(n log n)","O(n log n)","O(n)"},
            {"Quick Sort","Sort","O(n log n)","O(n log n)","O(n^2)","O(log n)"},
            {"Linear Search","Search","O(1)","O(n)","O(n)","O(1)"},
            {"Binary Search","Search","O(1)","O(log n)","O(log n)","O(1)"},
        };
        for(String[] row : rows)
            System.out.printf("  %-22s %-16s %-12s %-12s %-12s %-8s%n",(Object[])row);

        banner("All CO1-CO6 Outcomes Demonstrated Successfully");
    }

    // ─── Helpers ────────────────────────────────────────────────
    static String summarize(Tip[] arr){
        StringBuilder sb = new StringBuilder();
        for(Tip t : arr) sb.append(t.id).append("(").append(t.co2).append(") ");
        return sb.toString().trim();
    }
    static void banner(String msg){
        String line = "=".repeat(msg.length()+4);
        System.out.println("\n+" + line + "+");
        System.out.println("|  " + msg + "  |");
        System.out.println("+" + line + "+\n");
    }
    static void section(String title){
        System.out.println("\n+- " + title);
        System.out.println("|");
    }
}