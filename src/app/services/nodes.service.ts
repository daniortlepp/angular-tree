import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class NodesService {
  addNode(node, tree, name) {
    const newNode = {name: name};
    if (!node.data.children) {
      node.data.children = [];
    }
    node.data.children.push(newNode);
    tree.treeModel.update();

    const someNode = tree.treeModel.getNodeById(node.id);
    someNode.expand();
  }

  deleteNode(node, tree, selectedNode) {
    const parentNode = node.realParent ? node.realParent : node.treeModel.virtualRoot;
    parentNode.data.children = parentNode.data.children.filter(child => {
      return child !== node.data;
    });
    tree.treeModel.update();
    if (node && node.parent && node.parent.data && node.parent.data.children.length === 0) {
      node.parent.data.hasChildren = false;
    }

    if (selectedNode?.id === node.data.id) {
      selectedNode = null;
    }
  }
}