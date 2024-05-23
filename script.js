class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    updateHeight(node) {
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    balanceFactor(node) {
        return this.getHeight(node.left) - this.getHeight(node.right);
    }

    rotateRight(node) {
        const nodeLeftChild = node.left;
        const subtree = nodeLeftChild.right;

        nodeLeftChild.right = node;
        node.left = subtree;

        this.updateHeight(node);
        this.updateHeight(nodeLeftChild);

        return nodeLeftChild;
    }

    rotateLeft(node) {
        const nodeRightChild = node.right;
        const subtree = nodeRightChild.left;

        nodeRightChild.left = node;
        node.right = subtree;

        this.updateHeight(node);
        this.updateHeight(nodeRightChild);

        return nodeRightChild;
    }

    insert(node, value) {
        if (!node) return new Node(value);

        if (value < node.value) {
            node.left = this.insert(node.left, value);
        } else if (value > node.value) {
            node.right = this.insert(node.right, value);
        } else {
            return node;
        }

        this.updateHeight(node);

        const balance = this.balanceFactor(node);

        if (balance > 1 && value < node.left.value) {
            return this.rotateRight(node);
        }

        if (balance < -1 && value > node.right.value) {
            return this.rotateLeft(node);
        }

        if (balance > 1 && value > node.left.value) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }

        if (balance < -1 && value < node.right.value) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    insertValue(value) {
        this.root = this.insert(this.root, value);
    }
}

function calculateSubtreeWidths(node) {
    if (!node) return 0;

    const leftWidth = calculateSubtreeWidths(node.left);
    const rightWidth = calculateSubtreeWidths(node.right);

    node.subtreeWidth = Math.max(leftWidth, rightWidth) + 1;
    return node.subtreeWidth;
}

function calculatePositions(node, x, y, level = 1, positions = {}) {
    if (!node) return positions;

    const levelGap = 80;
    const horizontalGap = 40 * node.subtreeWidth;

    positions[node.value] = { x, y };

    if (node.left) {
        calculatePositions(node.left, x - horizontalGap, y + levelGap, level + 1, positions);
    }

    if (node.right) {
        calculatePositions(node.right, x + horizontalGap, y + levelGap, level + 1, positions);
    }

    return positions;
}

function drawNode(ctx, node, positions) {
    if (!node) return;

    const radius = 20;
    const { x, y } = positions[node.value];

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, x, y);

    if (node.left) {
        const leftPos = positions[node.left.value];
        const startAngle = Math.atan2(leftPos.y - y, leftPos.x - x);
        const startX = x + radius * Math.cos(startAngle);
        const startY = y + radius * Math.sin(startAngle);

        const endAngle = Math.atan2(y - leftPos.y, x - leftPos.x);
        const endNodeX = leftPos.x + radius * Math.cos(endAngle);
        const endNodeY = leftPos.y + radius * Math.sin(endAngle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endNodeX, endNodeY);
        ctx.stroke();
    }

    if (node.right) {
        const rightPos = positions[node.right.value];
        const startAngle = Math.atan2(rightPos.y - y, rightPos.x - x);
        const startX = x + radius * Math.cos(startAngle);
        const startY = y + radius * Math.sin(startAngle);

        const endAngle = Math.atan2(y - rightPos.y, x - rightPos.x);
        const endNodeX = rightPos.x + radius * Math.cos(endAngle);
        const endNodeY = rightPos.y + radius * Math.sin(endAngle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endNodeX, endNodeY);
        ctx.stroke();
    }

    drawNode(ctx, node.left, positions);
    drawNode(ctx, node.right, positions);
}

const canvas = document.getElementById('avlCanvas');
const ctx = canvas.getContext('2d');
const tree = new AVLTree();

document.getElementById('avlForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const value = parseInt(document.getElementById('valueInput').value);
    if (!isNaN(value)) {
        tree.insertValue(value);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        calculateSubtreeWidths(tree.root);
        const positions = calculatePositions(tree.root, canvas.width / 2, 30);
        drawNode(ctx, tree.root, positions);
        document.getElementById('valueInput').value = '';
    }
});
